# -*- coding: utf-8 -*-

"""
    Contains implementation of the projects resource.

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

import logging
import datetime

from flask import request
from collections import defaultdict

from quantifiedcode.settings import backend

from ...models import Project, UserRole, User, Tag
from ...decorators import valid_project, valid_user
from ...utils.api import ArgumentError, get_pagination_args

from ..resource import Resource

from .forms.project import ProjectForm, ProjectsForm, ProjectTagsForm, ProjectDetailsForm

logger = logging.getLogger(__name__)

class ProjectTags(Resource):

    def get(self):

        form = ProjectTagsForm(request.args)

        if not form.validate():
            return {'message' : 'please correct the errors mentioned below', 'errors' : form.errors}, 400

        data = form.data
        query = {'name': {'$ilike': "%%{}%%".format(data['name'])}}
        tags = backend.filter(Tag, query, only=['name', 'pk'], raw=True)

        return {'tags': [tag['name'] for tag in tags[:10]]}, 200

    @valid_user()
    @valid_project(roles=('admin', 'owner'))
    def post(self, project_id):

        form = ProjectTagsForm(request.form)

        if not form.validate():
            return {'message' : 'please correct the errors mentioned below.', 'errors' : form.errors}, 400

        data = form.data

        with backend.transaction():
            try:
                tag = backend.get(Tag, {'name': data['name']})
            except Tag.DoesNotExist:
                return {'message': 'invalid tag'}, 404
            request.project.tags.append(tag)
        return {'message': 'success!'}, 200

    @valid_user()
    @valid_project(roles=('admin', 'owner'))
    def delete(self, project_id):

        form = ProjectTagsForm(request.form)

        if not form.validate():
            return {'message' : 'please correct the errors mentioned below.', 'errors' : form.errors}, 400

        data = form.data

        with backend.transaction():
            try:
                tag = backend.get(Tag, {'name': data['name']})
            except Tag.DoesNotExist:
                return {'message': 'Does not exist'}, 404
            if tag in request.project.tags:
                request.project.tags.remove(tag)

        return {'message': 'success!'}, 200

class ProjectDetails(Resource):

    """
    Source: User Backend
    """

    export_map = [
        'pk',
        'name',
        'source',
        'public',
        'analyze',
        'reset',
        'description',
        {'tags': lambda tags: [tag['name'] for tag in tags]},
        'reset_requested_at',
        'analysis_priority',
        'first_analysis_finished',
        'permalink',
        'analysis_requested_at',
        'analyis_priority',
        'analysis_status',
        'analyzed_at',
        'fetched_at',
        'fetch_status',
        'fetch_error',
        {'stats': [{'summary': {'*': {'metrics': ''}}},
                   {'issues_summary': ''},
                   'snapshot']}
    ]

    includes = ['tags']

    @valid_user(anon_ok=True)
    @valid_project(only=None, public_ok=True, include=includes)
    def get(self, project_id):

        form = ProjectDetailsForm(request.args)

        if not form.validate():
            return {'message' : 'please correct the errors mentioned below.', 'errors' : form.errors}, 400

        data = form.data

        exported_project = self.export(request.project)
        #we add the analysis queue position of the project
        exported_project['analysis_queue_position'] = request.project.get_analysis_queue_position()

        exported_project['user_role'] = 'anon'
        if request.user is not None:
            try:
                #we add role information to the project (useful for displaying the correct menus)
                user_role = backend.get(UserRole,{'project' : request.project, 'user' : request.user})
                exported_project['user_role'] = user_role.role
            except UserRole.DoesNotExist:
                pass

        if data['with_stats']:
            exported_project['stats'] = request.project.stats

        return {'project': exported_project}, 200

    @valid_user
    @valid_project(roles=('owner',))
    def delete(self, project_id):
        with backend.transaction():
            backend.update(request.project, {'delete': True})
        return ({'message': 'success! Your project will be fully deleted within a few minutes.',
                 'project_id': request.project.pk},
                200)

    @valid_user
    @valid_project(roles=('owner', 'admin'))
    def put(self, project_id):
        form = ProjectForm(request.form)
        if not form.validate():
            return ({'message': 'Please correct the errors mentioned below.',
                     'errors': form.errors},
                    400)

        data = {}

        if form.description.data:
            data['description'] = form.description.data

        if form.public.data is not None:
            data['public'] = form.public.data

        for key, value in data.items():
            request.project[key] = value

        with backend.transaction():
            backend.update(request.project, data.keys())

        return ({'message': 'success!',
                 'project': self.export(request.project)},
                200)


class ProjectRoles(Resource):

    export_map = (
        {'user': ('name', 'pk')},
        'role',
        'pk',
    )

    @staticmethod
    def _get_user(user_id):
        try:
            return backend.get(
                User,
                {'$or': [{'name': user_id},
                         {'pk': user_id}]}
            )
        except (User.DoesNotExist, User.MultipleDocumentsReturned):
            raise AttributeError()

    @valid_user
    @valid_project(roles=('owner',))
    def post(self, project_id, role, user_id):

        with backend.transaction():
            try:
                user = self._get_user(user_id)
            except AttributeError:
                return ({'message': 'invalid user'},
                        404)

            if role not in ('admin', 'collaborator', 'owner'):
                return ({'message': 'invalid role: %s' % role},
                        403)
            try:
                user_role = backend.get(UserRole, {'project': request.project,
                                                   'user': user})
                if user_role.role == 'owner' and user_role.user == request.user and role != 'owner':
                    if len(backend.filter(UserRole, {'project': request.project,'role' : 'owner'})) == 1:
                        return {'message' : 'You are the last owner of this project, cannot remove you.'}, 400
            except UserRole.DoesNotExist:
                user_role = UserRole({'project': request.project, 'user': user})
            user_role.role = role
            backend.save(user_role)
        return ProjectRoles.get(self, project_id=project_id)

    @valid_user
    @valid_project(roles=('owner',))
    def get(self, project_id):
        roles = backend.filter(UserRole, {'project': request.project}, include=(('user', 'name', 'pk'),))
        return {'roles': [self.export(role) for role in roles]}, 200

    @valid_user
    @valid_project(roles=('owner',))
    def delete(self, project_id, user_role_id):
        with backend.transaction():
            try:
                user_role = backend.get(UserRole, {'project': request.project, 'pk': user_role_id})
                if user_role.role == 'owner' and user_role.user == request.user:
                    if len(backend.filter(UserRole, {'project': request.project,'role' : 'owner'})) == 1:
                        return {'message' : 'You are the last owner of this project, cannot remove you.'}, 400
            except UserRole.DoesNotExist:
                return {'message': 'invalid role'}, 404

            backend.delete(user_role)

        return {'message': 'success'}, 200

class ProjectAnalysis(Resource):
    """
    Source: Project Backend
    """

    export_map = ('pk',
                  'shas',
                  'status',
                  'failed_at',
                  'completed_at',
                  'created_at')

    @valid_user(anon_ok=True)
    @valid_project(private_ok=True)
    def post(self, project_id):
        return self._schedule_analysis(project_id)

    @valid_user(anon_ok=True)
    @valid_project(private_ok=True)
    def get(self, project_id):
        # We include a GET endpoint to make this compatible with the Github API
        return self._schedule_analysis(project_id)

    @staticmethod
    def _schedule_analysis(project_id, analysis_priority=Project.AnalysisPriority.high):
        if not (request.project.get('analyze') and request.project.get('analysis_priority', Project.AnalysisPriority.low) >= analysis_priority):
            with backend.transaction():
                backend.update(request.project,
                               {'analyze': True,
                                'analysis_requested_at': datetime.datetime.now(),
                                'analysis_priority': analysis_priority})
            return ({'message': 'Success, project scheduled for analysis. Please be patient.'},
                    200)
        else:
            return ({'message': 'Project was already scheduled for analysis. Please be patient.'},
                    200)

    @valid_user
    @valid_project(roles=("admin", "owner"))
    def delete(self, project_id):
        with backend.transaction():
            backend.update(
                request.project,
                {'reset': True,
                 'reset_requested_at': datetime.datetime.now()})
        return ({'message': 'Success, project scheduled for reset. Please be patient.'},
                200)


class Projects(Resource):
    """
    Source: User Backend
    """

    export_map = (
        'pk',
        'name',
        'public',
        'analyze',
        'reset',
        'description',
        'reset_requested_at',
        'analysis_priority',
        'first_analysis_finished',
        'permalink',
        'analysis_requested_at',
        'analyis_priority',
        'source',
        'analyzed_at',
        'analysis_status',
        'fetched_at',
        'fetch_status',
        {'stats': [{'summary': {'*': {'metrics': ''}}},
                   {'issues_summary': ''},
                   'snapshot',
                   'n_commits']}
    )

    @valid_user
    def get(self):

        form = ProjectsForm(request.args)

        if not form.validate():
            return {'message' : 'please correct the errors mentioned below'}, 400

        data = form.data
        limit, offset = data['limit'], data['offset']
        query = {'user_roles.user': request.user}

        if data['query']:
            search_dict = {
                '$or': [
                    {'$and': [{'name': {'$ilike': '%%%s%%' % q}} for q in data['query']]}
                ]
            }
            query = {'$and': [query, search_dict]}

        projects = backend.filter(
            Project,
            query,
            raw=True,
            only=self.export_fields,
            include=(('tags', 'name', 'pk'),)
        ).sort(data['sort'], data['direction'], explicit_nullsfirst=False)

        serialized_projects = [
            self.export(project)
            for project in projects[offset:offset + limit]
            ]

        return ({'projects': serialized_projects,
                 'count': len(projects)},
                200)
