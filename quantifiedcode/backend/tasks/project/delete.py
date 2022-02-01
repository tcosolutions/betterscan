# -*- coding: utf-8 -*-

"""

    Contains celery tasks for projects

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

import os
import shutil
import logging
import datetime

logger = logging.getLogger(__name__)

from checkmate.contrib.plugins.git.commands.update_stats import Command as UpdateStatsCommand
from checkmate.management.commands.reset import Command as ResetCommand
from quantifiedcode.settings import settings, backend
from quantifiedcode.backend.tasks.helpers import ExclusiveTask,TaskLogger
from quantifiedcode.backend.settings import BACKEND_PATH

from ...worker import celery
from ...models import (Project,
                       Task,
                       UserRole,
                       IssueClass,
                       ProjectIssueClass)

@celery.task(queue="analysis", ignore_result=False)
def delete_project(project_id, task_id=None):
    """ Deletes the project with the given project id.
    :param project_id: id of the project to delete
    :param task_id: id of the task
    """
    if not task_id:
        task_id = analyze_project.request.id
    try:
        project = backend.get(Project, {'pk': project_id})
    except Project.DoesNotExist:
        logger.error("Project {} does not exist! Cannot delete it.".format(project_id))
        return

    try:
        with ExclusiveTask(
                backend,
                {'project.pk': project.pk, 'type': {'$in': ['analysis', 'reset', 'delete']}},
                {'type': 'delete', 'project': project},
                task_id,
                no_update_on_exit=True
        ) as delete_task:
            with TaskLogger(delete_task, backend=backend, ping=True):
                _delete_project(project)
                logger.info("Deletion of project {} ({}) complete!".format(project.name, project.pk))

    except ExclusiveTask.LockError:
        logger.info("Unable to acquire lock for deletion of project {} ({}).".format(project.name, project.pk))

def _delete_project(project):
    """
    Deletes the given project
    """

    checkmate_settings = settings.checkmate_settings

    with backend.transaction():
        logger.info("Starting deletion of project {0} ({1}).".format(project.name, project.pk))

        # This should delete everything checkmate-related.
        reset_command = ResetCommand(project, checkmate_settings, backend)
        reset_command.run()

        settings.hooks.call("project.delete.before", project)

        backend.filter(ProjectIssueClass, {'project': project}).delete()
        backend.filter(UserRole, {'project': project}).delete()
        backend.filter(Task, {'project': project}).delete()
        backend.delete(project)

        settings.hooks.call("project.delete.after", project)
