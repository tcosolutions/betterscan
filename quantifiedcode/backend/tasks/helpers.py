# -*- coding: utf-8 -*-

"""
    Contains export function used to translate database objects into dictionaries based on a mapping.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

import logging
import time
import datetime
import traceback
import random
import os

from ..worker import celery
from ..models import Task
from quantifiedcode.settings import settings

logger = logging.getLogger(__name__)

def launch_task_group(group, function, limit=6):

    logger.debug("Launching task group: %s with limit %d" % (group, limit))

    i = celery.control.inspect()
    active_tasks = i.active()

    active_cnt = 0
    if active_tasks:
        for host, tasks in active_tasks.items():
            if host.startswith("%s@" % group):
                active_cnt += len(tasks)

    while active_cnt < limit:
        logger.debug("Scheduling new task in group %s." % group)
        function.delay()
        active_cnt += 1

class TaskPingHandler(logging.FileHandler):
    def __init__(self, backend, task, ping_interval=10, *args, **kwargs):
        self.backend = backend
        self.task = task
        self.last_ping = None
        self.ping_interval = ping_interval
        super(TaskPingHandler, self).__init__(*args, **kwargs)

    def emit(self, record, *args, **kwargs):
        if (not self.last_ping or
                (datetime.datetime.now() - self.last_ping > datetime.timedelta(seconds=self.ping_interval))):
            self.last_ping = datetime.datetime.now()
            with self.backend.transaction():
                self.backend.update(self.task,
                                    {'last_ping': self.last_ping})
        super(TaskPingHandler, self).emit(record)


class TaskLogger(object):
    """
    Creates a task logger that writes all output from a given task to a log file.
    """

    def __init__(self, task, level=logging.INFO, backend=None, ping=True):
        self.task = task
        self.level = level
        self.backend = backend
        self.ping = ping

    def __enter__(self):
        kwargs = {
            'filename': os.path.join(settings.get('backend.path'), settings.get('backend.paths.tasks'),
                                     self.task.pk + '.log'),
            'encoding': "utf-8",
            'mode': "w",
        }

        if self.ping and self.backend:
            self.task_logger = TaskPingHandler(self.backend, self.task, **kwargs)
        else:
            self.task_logger = logging.FileHandler(**kwargs)

        self.task_logger.setLevel(self.level)
        self.formatter = logging.Formatter('[%(levelname)s / %(asctime)s] %(message)s', "%Y-%m-%d %H:%M:%S")
        self.task_logger.setFormatter(self.formatter)
        logging.getLogger('').addHandler(self.task_logger)

    def __exit__(self, exc_type, exc_value, tb):
        try:
            if exc_type:
                logging.getLogger('').error("".join(traceback.format_exception(exc_type, exc_value, tb)))
            logging.getLogger('').removeHandler(self.task_logger)
        except:
            logger.warning("Cannot remove task logger.")
        return False


class ExclusiveTask(object):

    class ResultState:
        Pending = 'PENDING'
        Started = 'STARTED'
        Failed = 'FAILED'
        Success = 'SUCCESS'

    class LockError(BaseException):
        pass

    """
    Creates an exclusive task.

    :param query_data:
    """

    def __init__(self, backend, query_data, task_data, task_id, no_update_on_exit=False):

        self.query_data = query_data
        self.task_data = task_data
        self.task_id = task_id
        self.backend = backend
        self.no_update_on_exit = no_update_on_exit

    def __enter__(self):

        def task_is_being_processed(current_task=None):

            query = {'status': 'in_progress'}
            query.update(self.query_data)
            tasks = self.backend.filter(Task, query). \
                sort('created_at', -1)

            for task in tasks:
                if current_task and task == current_task:
                    continue
                if datetime.datetime.now() - task.created_at < datetime.timedelta(seconds=10):
                    return True
                if 'celery_task_id' in task and self.task_id:
                    try:
                        res = celery.AsyncResult(task.celery_task_id)
                        with self.backend.transaction():
                            if res.state == ResultState.Started:
                                self.backend.update(task, {'status': 'in_progress'})
                                return True
                            elif res.state == ResultState.Pending:
                                if task.get('last_ping'):
                                    # if we haven't heard from the task in a while, we mark it as failed...
                                    if datetime.datetime.now() - task.last_ping > datetime.timedelta(seconds=60 * 10):
                                        self.backend.update(task, {'status': 'failed'})
                                        continue
                                elif datetime.datetime.now() - task.created_at < datetime.timedelta(seconds=60 * 20):
                                    self.backend.update(task, {'status': 'in_progress'})
                                    return True
                            elif res.state == ResultState.Failure:
                                self.backend.update(task, {'status': 'failed'})
                            elif res.state == ResultState.Success:
                                self.backend.update(task, {'status': 'succeeded'})
                    except Task.DoesNotExist:
                        # sometimes a task object will get deleted by another worker while
                        # being processed, so we ignore DoesNotExist errors when updating the task...
                        continue
                    except:
                        logger.error("Cannot update task %s:" % task.pk)
                        logger.error(traceback.format_exc())
                        pass
            return False

        if task_is_being_processed():
            raise self.LockError("Task is currently being processed by another worker...")

        task_dict = {
            'celery_task_id': self.task_id,
            'status': 'in_progress',
        }
        task_dict.update(self.task_data)

        task = Task(task_dict)
        with self.backend.transaction():
            self.backend.save(task)

        time.sleep(1.0 + random.random() * 3.0)

        if task_is_being_processed(task):
            with self.backend.transaction():
                self.backend.delete(task)
            raise self.LockError("Task is currently being processed by another worker...")

        self.task = task
        self.started_at = time.time()

        return task

    def __exit__(self, exc_type, exc_value, tb):

        if self.no_update_on_exit:
            return False

        with self.backend.transaction():
            if exc_type is not None:
                logger.error("Task %s failed." % self.task.pk)
                exc_info = traceback.format_exception(exc_type, exc_value, tb)
                logger.error(exc_info)
                try:
                    exception_type = exc_value.__class__.__name__
                except:
                    exception_type = '(unknown)'
                self.backend.update(
                    self.task,
                    {'status': 'failed',
                     'duration': time.time() - self.started_at,
                     'failed_at': datetime.datetime.now(),
                     'exception': exc_info,
                     'exception_type': exception_type}
                )
            else:
                logger.info("Task succeeded.")
                self.backend.update(self.task,
                                    {'status': 'succeeded',
                                     'duration': time.time() - self.started_at,
                                     'succeeded_at': datetime.datetime.now()})

        return False
