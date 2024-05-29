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
    Contains implementation of the projects resource.

"""





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
            'url' : form.url.data,
            'private_key' : form.private_key.data
        }

        try:
            project = create_project(project_data, git_data, user)
        except DuplicateProject:
            return ({'message': 'A project with the same name already exists for your account.'},
                    403)
        return ({'message': 'success!',
                 'project': self.export(project)},
                200)
