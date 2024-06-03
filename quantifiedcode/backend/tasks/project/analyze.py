"""
This file is part of Betterscan CE (Community Edition).

Betterscan is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Betterscan is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Betterscan. If not, see <https://www.gnu.org/licenses/>.

Originally licensed under the BSD-3-Clause license with parts changed under
LGPL v2.1 with Commons Clause.
See the original LICENSE file for details.

"""
# -*- coding: utf-8 -*-

"""

    Contains celery tasks for projects

"""





import os
import shutil
import logging
import datetime

from quantifiedcode.settings import settings, backend
from quantifiedcode.backend.settings import BACKEND_PATH

from ...worker import celery
from ...models import (Project,
                       Task,
                       IssueClass,
                       ProjectIssueClass)

from ..helpers import ExclusiveTask, TaskLogger

from ...tasks.email import send_mail

import urllib.request, urllib.parse, urllib.error
import json



logger = logging.getLogger(__name__)

def hook_step(project, hook, message):
    logger.info("{} for project {p.name} ({p.pk}).".format(message, p=project))

    try:
        settings.hooks.call(hook, project)
    except Exception as e:
        logger.error("{} for project {p.name} ({p.pk}) failed!".format(message, p=project))
        logger.error("Exception {} {}.".format(e.__class__.__name__, e.strerror))
        raise

class AnalysisFailedException(Exception):
    """ Raised when analysis of the project fails """
    pass

@celery.task(queue="analysis", ignore_result=False)
def analyze_project(project_id, task_id=None):
    """ Performs an analysis of the project with the given id
    :param project_id: primary key of the project
    :param task_id: celery task id
    :return:
    """

    if not task_id:
        task_id = analyze_project.request.id
    try:
        project = backend.get(Project, {'pk': project_id})
    except Project.DoesNotExist:
        logger.error("Project {} does not exist".format(project_id))
        return

    try:
        with ExclusiveTask(
                backend,
                {'project': project, 'type': {'$in': (Task.Type.analysis,Task.Type.reset,Task.Type.delete)}},
                {'project': project, 'type': Task.Type.analysis},
                task_id,
        ) as analysis_task:
            with TaskLogger(analysis_task, backend=backend, ping=True):
                _analyze_project(project)
    except ExclusiveTask.LockError:
        # We were unable to acquire a lock for this project.
        pass
    finally:
        logger.info("Done.")

def _analyze_project(project):
    update_analysis_status(project, project.AnalysisStatus.in_progress, extra={'analyze': False})

    if project_deleted(project):
        update_analysis_status(project, project.AnalysisStatus.succeeded)
        return

    try:
        hook_step(project, "project.analyze.before", "Running pre-analysis hooks")
        hook_step(project, "project.analyze.fetch", "Fetching data")

        add_relevant_issue_classes(project)

        hook_step(project, "project.analyze.analyze", "Running analysis")
        hook_step(project, "project.analyze.after", "Running post-analysis hooks")

        logger.info("Analysis of project {p.name} ({p.pk}) complete!".format(p=project))
        update_analysis_status(project, project.AnalysisStatus.succeeded)
        

    except Exception as e:
        logger.error("Analysis of project {p.name} ({p.pk}) failed!".format(p=project))
        update_analysis_status(project, project.AnalysisStatus.succeeded)
        raise

def update_analysis_status(project, status, extra=None):
    """ Updates the analysis status of the given project to the given status.
    :param project: project to update the analysis status for
    :param status: new analysis status
    :param extra: dictionary with extra data to update
    """
    extra = extra if extra is not None else {}
    with backend.transaction():
        data = extra.copy()
        data['analyzed_at'] = datetime.datetime.now()
        data['analysis_status'] = status
        backend.update(project, data)

def project_deleted(project):
    """ Before analysis hook. If this project has been deleted, don't analyze it.
    :param project: project that is being analyzed
    :return:
    """
    return project.get('deleted', False) or project.get('delete', False)

def add_relevant_issue_classes(project):
    """ Adds relevant issue classes to the given project. Only adds issue classes that were created after the last time
    this function was ran, avoiding re-adding issue classes that the user may have removed from the project.
    :param project: project to add the issue classes to
    :return:
    """
    issue_classes = get_relevant_issue_classes(project)
    logger.info("Adding %d issue_classes to project %s" % (len(issue_classes), project.pk))

    with backend.transaction():
        for issue_class in issue_classes:
            project_issue_class_query = {
                'project': project,
                'issue_class': issue_class
            }
            try:
                backend.get(ProjectIssueClass, project_issue_class_query)
                continue
            except ProjectIssueClass.DoesNotExist:
                project_issue_class = ProjectIssueClass(project_issue_class_query)
                project_issue_class.enabled = True
                backend.save(project_issue_class)

        # re-sync the issue classes associated with the project with the database
        project.revert()

def get_relevant_issue_classes(project):
    """ Returns all relevant issue classes applicable to the given project.
    :param project: project to get the relevant issue classes for
    :return: relevant issue classes
    """
    allowed_tags = ['generic'] + [tag.name for tag in project.tags]
    query = {
        'tags.name': {
            '$in': allowed_tags,
        }
    }
    return backend.filter(IssueClass, query)
