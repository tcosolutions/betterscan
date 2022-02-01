# -*- coding: utf-8 -*-

"""
    Contains implementation of the projects resource.

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

import re
import logging
import datetime

from flask import request

from quantifiedcode.settings import backend
from quantifiedcode.backend.models import Project, UserRole, User
from quantifiedcode.backend.decorators import valid_project, valid_user
from quantifiedcode.backend.utils.api import ArgumentError, get_pagination_args
from quantifiedcode.backend.api.v1.project import ProjectDetails as BaseProjectDetails

from quantifiedcode.backend.api.resource import Resource

from ..forms.project import NewProjectForm, EditProjectForm

from quantifiedcode.plugins.git.backend.tasks.create import create_project

logger = logging.getLogger(__name__)

class ProjectDetails(Resource):

    """
    Source: User Backend
    """

    export_map = BaseProjectDetails.export_map

    @valid_user()
    @valid_project(include=('git',))
    def put(self, project_id):
        form = EditProjectForm(request.form)
        project = request.project
        if project.git is None:
            return {'message' : 'not a Git project!'}, 400
        if not form.validate():
            return ({'message': 'Please correct the errors mentioned below.',
                     'errors': form.errors},
                    400)

        with backend.transaction():
            backend.update(project.git, form.data)

        return {'message' : 'success'}, 200


    @valid_user()
    def post(self):
        user = request.user
        form = NewProjectForm(request.form)
        if not form.validate():
            return ({'message': 'Please correct the errors mentioned below.',
                     'errors': form.errors},
                    400)

        project_data = {
            'public': form.public.data,
            'source' : 'git',
            'name': form.name.data,
            'description': form.description.data,
            'analyze' : True,
            'analysis_priority' : Project.AnalysisPriority.high,
            'analysis_requested_at' : datetime.datetime.now()
        }

        git_data = {
            'default_branch' : 'origin/master',
            'url' : form.url.data
        }

        try:
            project = create_project(project_data, git_data, user)
        except DuplicateProject:
            return ({'message': 'A project with the same name already exists for your account.'},
                    403)
        return ({'message': 'success!',
                 'project': self.export(project)},
                200)
