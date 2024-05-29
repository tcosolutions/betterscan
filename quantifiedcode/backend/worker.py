/*
 * This file is part of Betterscan CE (Community Edition).
 *
 * Betterscan is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Betterscan is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Betterscan. If not, see <https://www.gnu.org/licenses/>.
 *
 * Originally licensed under the BSD-3-Clause license with parts changed under
 * LGPL v2.1 with Commons Clause.
 * See the original LICENSE file for details.
*/
# -*- coding: utf-8 -*-

"""

    Celery worker used to perform the tasks specified in the tasks directory.

"""




import logging
import datetime
import importlib

#from celery import Celery, __version__ as celery_version
from celery import Celery
from celery.schedules import crontab
from celery.signals import worker_init
from kombu import Queue

from .helpers.celery import config_mapping_3_4
from quantifiedcode.settings import settings

logger = logging.getLogger(__name__)

@worker_init.connect
def initialize_settings(send=None, body=None, **kwargs):
    """
    Called when a new celery worker is started, initializes all settings and their hooks.
    """
    settings.initialize()

def make_celery():
    """
    Creates a new celery object which can be used to define tasks.
    """
    celery_settings = settings.get('backend.celery',{})
    celery_config = celery_settings.get('config',{})
    celery_obj = Celery("quantifiedcode", broker=celery_config['broker_url'])
    
    #we convert the queues
    queues = []
    for queue in celery_config.get('task_queues',[]):
        queues.append(Queue(**queue))
    celery_config['task_queues'] = queues

    #we parse the celerybeat task schedule
    celerybeat_schedule = celery_settings.get('celerybeat-schedule', {})
    new_schedule = {}
    for task, params in list(celerybeat_schedule.items()):
        params = params.copy()
        if not 'schedule' in params:
            logger.warning("No schedule for task {}, skipping...".format(task))
            continue
        schedule = params.get('schedule', {})
        if 'timedelta' in schedule:
            params['schedule'] = datetime.timedelta(**schedule['timedelta'])
        elif 'crontab' in schedule:
            params['schedule'] = crontab(**schedule['crontab'])
        else:
            logger.error("Unknown schedule format for task {}, skipping...".format(task))
            continue
        new_schedule[task] = params

    celery_config['beat_schedule'] = new_schedule

    #if we use Celery 3, we map the config parameter names to the old format
    #if celery_version.startswith('3.'):
    #    for key, value in list(celery_config.items()):
    #        if key in config_mapping_3_4:
    #            del celery_config[key]
    #            celery_config[config_mapping_3_4[key]] = value

    celery_obj.conf.update(**celery_config)

    return celery_obj

celery = make_celery()
