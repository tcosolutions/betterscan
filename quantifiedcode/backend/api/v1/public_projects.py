# -*- coding: utf-8 -*-

"""

    Contains implementation of the projects resource for the GitHub plugin.

"""

from __future__ import unicode_literals
from __future__ import print_function

import re

from flask import request

from quantifiedcode.settings import backend
from quantifiedcode.backend.api.v1.project import Projects as BaseProjects
from quantifiedcode.backend.decorators import valid_user
from quantifiedcode.backend.models import Project
from quantifiedcode.backend.utils.api import ArgumentError, get_pagination_args

from .forms.project import PublicProjectsForm
import pprint

class PublicProjects(BaseProjects):
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
        'permalink',
        'analysis_status',
        'analyzed_at',
    )

    @valid_user(anon_ok=True)
    def get(self):


        form = PublicProjectsForm(request.args)

        if not form.validate():
            return {'message' : 'please correct the errors mentioned below', errors: form.errors}, 400

        data = form.data

        query = {'public': True}

        if not data['show_failed']:
            query['analysis_status'] = {
                '$in': [
                    'succeeded',
                    'in_progress'
                ]
            }

        query = {
            '$and': [
                query,
                {'$or': [{'deleted': {'$exists': False}}, {'deleted': False}]},
                {'$or': [{'delete': {'$exists': False}}, {'delete': False}]},
            ]
        }

        if data['query']:

            search_dict = {
                '$or': [
                    {'$and': [{'name': {'$ilike': '%%%s%%' % q}} for q in data['query']]}
                ]
            }
            query = {'$and': [query, search_dict]}

        projects = backend.filter(Project, query, raw=True, only=self.export_fields)

        projects = projects.sort(data['sort'], data['direction'], explicit_nullsfirst=False)

        offset, limit = data['offset'], data['limit']

        serialized_projects = [self.export(project) for project in projects[offset:offset + limit]]
        for proj in serialized_projects:
          if not proj['description']:
            proj['description']="None"


        res = {
            'projects': serialized_projects,
            'count': len(projects),
            'offset': offset,
            'limit': limit,
            'query' : data['query']
        }

        return res, 200
