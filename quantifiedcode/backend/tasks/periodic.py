
from ..worker import celery
from .helpers import launch_task_group
from .user import delete_user

import logging
import datetime

from quantifiedcode.settings import backend
from quantifiedcode.backend.models import Project, User
from quantifiedcode.backend.tasks.project import analyze_project, delete_project, reset_project

logger = logging.getLogger(__name__)

@celery.task(time_limit=240, queue="tasks", ignore_result=False)
def start_delete_tasks():
    launch_task_group("delete", delete_pending_project, limit=3)
    launch_task_group("delete", delete_pending_user, limit=3)

@celery.task(time_limit=240, queue="tasks", ignore_result=False)
def start_reset_tasks():
    launch_task_group("reset", reset_pending_project, limit=3)

@celery.task(time_limit=240, queue="tasks", ignore_result=False)
def start_analysis_tasks():
    launch_task_group("analyze", analyze_pending_project, limit=15)

@celery.task(queue="delete", ignore_result=False, time_limit=3600)
def delete_pending_project():
    pending_projects = backend.filter(Project, {'delete': True}).sort('updated_at', 1).limit(100)
    logger.debug("%d projects marked for deletion" % len(pending_projects))
    for pending_project in pending_projects:
        return delete_project(pending_project.pk, task_id=delete_pending_project.request.id)
    logger.debug("No projects left to delete...")

@celery.task(queue="delete", ignore_result=False, time_limit=3600)
def delete_pending_user():
    pending_users = backend.filter(User, {'delete': True}).sort('updated_at', 1).limit(100)
    logger.debug("%d users marked for deletion" % len(pending_users))
    for pending_user in pending_users:
        return delete_user(pending_user.pk, task_id=delete_pending_user.request.id)
    logger.debug("No users left to delete...")

@celery.task(queue="reset", ignore_result=False)
def reset_pending_project():
    try:
        pending_project = backend.filter(Project, {'reset': True}).sort('reset_requested_at', 1).limit(1)[0]
    except IndexError:
        logger.debug("No projects left to reset....")
        return
    with backend.transaction():
        backend.update(pending_project, {'reset_requested_at': datetime.datetime.now()})
    return reset_project(pending_project.pk, task_id=reset_pending_project.request.id)

@celery.task(time_limit=60*60*4, queue="analysis")
def analyze_pending_project():
    """ Get all projects that are marked for analysis and sort them by priority and request date.
    Then go through the list and check if the project has been recently analyzed, if not, analyze the first project.
    """
    logger.debug("Retrieving projects pending analysis...")

    pending_projects_query = {
        '$and': [
            {'analyze': True},
            {'$or': [
                {'deleted': {'$exists': False}},
                {'deleted': False}
            ]}
        ]
    }
    pending_projects = backend.filter(Project, pending_projects_query)
    pending_projects.sort([['analysis_priority', -1], ['analysis_requested_at', 1]]).limit(100)

    timestamp = datetime.datetime.now()
    max_allowed_runtime = datetime.timedelta(minutes=120)
    for pending_project in pending_projects:

        # skip projects currently being analyzed unless the analysis has been running for too long
        if (pending_project.analysis_status == pending_project.AnalysisStatus.in_progress and
                timestamp - pending_project.analyzed_at < max_allowed_runtime):
            continue

        # move the project back in the queue
        with backend.transaction():
            backend.update(pending_project, {'analysis_requested_at': datetime.datetime.now()})

        analyze_project(pending_project.pk, task_id=analyze_pending_project.request.id)
        break
