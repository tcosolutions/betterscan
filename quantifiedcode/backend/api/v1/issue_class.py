# -*- coding: utf-8 -*-

"""
    Implements Issue Class resources
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

from flask import request

from quantifiedcode.settings import backend
from quantifiedcode.backend.models import IssueCategory, Tag, Project, IssueClass, ProjectIssueClass

from .forms.issue_class import IssueClassForm
from ...utils.api import ArgumentError, get_pagination_args
from ...decorators import valid_user, valid_project, valid_issue_class
from ..resource import Resource
from .project import Projects

from sqlalchemy.sql import select, distinct

class IssueClasses(Resource):

    sort_choices = {
        'title': 'title',
        'created_at': 'created_at',
        'updated_at': 'updated_at',
        'severity': 'severity'
    }

    export_map = (
        'title',
        'analyzer',
        'language',
        'code',
        'pk',
        'severity',
        'validated',
        'published',
        {'categories': lambda categories: [category.name for category in categories]},
        {'creator': ['pk', 'name']},
        {'tags': lambda tags: [tag.name for tag in tags]},
        'created_at',
        'updated_at',
        'used_by_project',
    )

    LIMIT = 20

    @staticmethod
    def get_project(project_id):
        if not project_id:
            return None
        try:
            project = backend.get(Project, {'pk': project_id})
            if not project.is_authorized(request.user):
                return None
            return project
        except Project.DoesNotExist:
            return None

    @valid_user(anon_ok=True)
    def get(self):

        #we get all distinct values of languages, analyzers, categories and tags (used by the frontend)
        issue_classes_table = backend.get_table(IssueClass)
        categories_table = backend.get_table(IssueCategory)
        tags_table = backend.get_table(Tag)

        with backend.transaction():
            languages = [l[0] for l in backend.connection.execute(select([distinct(issue_classes_table.c.language)])).fetchall()]
            analyzers = [a[0] for a in backend.connection.execute(select([distinct(issue_classes_table.c.analyzer)])).fetchall()]
            categories = [c[0] for c in backend.connection.execute(select([distinct(categories_table.c.name)])).fetchall()]
            tags = [t[0] for t in backend.connection.execute(select([distinct(tags_table.c.name)])).fetchall()]

        form = IssueClassForm(languages, analyzers, categories, request.args)
        if not form.validate():
            return ({'message': 'Please correct the errors mentioned below.',
                     'errors': form.errors},
                    400)

        project = self.get_project(form.data['project_id'])

        params = {}
        data = form.data

        if data['severity']:
            params['severity'] = {'$in' : data['severity']}

        if data['categories']:
            params['categories.name'] = {'$in' : data['categories']}

        if data['language']:
            params['language'] = {'$in' : data['language']}

        if data['analyzer']:
            params['analyzer'] = {'$in' : data['analyzer']}

        if data['query']:
            query = data['query']
            if query['tag_queries']:
                params = {'$and' : [params, {'tags.name' : {'$all' : query['tag_queries']}}]}
            if query['title_queries']:
                params = {'$and' : [params, {'$and' : [{'title' : q} for q in query['title_queries']]}]}

        if data['type'] and project:
            ic_query = {
                'project_issue_classes.project' : project,
            }
            if data['type'] != 'all':
                ic_query['project_issue_classes.enabled'] = data['type'] == 'enabled'
            params = {'$and' : [params, ic_query]}

        sort = data['sort']
        direction = data['direction']
        limit = data['limit']
        offset = data['offset']

        issue_classes = backend.filter(
            IssueClass,
            params,
            only=self.export_fields,
            include=('categories', 'creator', 'tags',),
        ).sort([(sort, direction), ('title', 1)])

        count = len(issue_classes)
        issue_classes = issue_classes[offset:offset + limit]

        if project:
            if data['type'] == 'all':
                active_issue_classes = issue_classes.filter({'project_issue_classes.project': project,
                                                             'project_issue_classes.enabled': True})
                active_issue_classes_by_pk = {issue_class.pk: issue_class for issue_class in active_issue_classes}
                for issue_class in issue_classes:
                    if issue_class.pk in active_issue_classes_by_pk:
                        issue_class.used_by_project = True
                    else:
                        issue_class.used_by_project = False
            else: #if we already checked for the enabled field, we just copy the parameter
                for issue_class in issue_classes:
                    issue_class.used_by_project = data['type'] == 'enabled'


        return ({'issue_classes': [self.export(issue_class)
                                   for issue_class in issue_classes],
                 'count': count,
                 'languages' : languages,
                 'analyzers' : analyzers,
                 'categories' : categories,
                 'tags' : tags
                 },
                200)

class ProjectIssueClasses(IssueClasses):

    """
    Adds or removes issue classes from a project.
    """

    @staticmethod
    def _get_project_issue_class():
        query = {
            'project': request.project,
            'issue_class': request.issue_class
        }
        try:
            project_issue_class = backend.get(ProjectIssueClass, query)
        except ProjectIssueClass.DoesNotExist:
            project_issue_class = ProjectIssueClass(query)
        return project_issue_class

    @valid_user(anon_ok=False)
    @valid_project(roles=('owner', 'admin'))
    @valid_issue_class
    def delete(self, project_id, issue_class_id):
        """
        Delete an issue class from a project.
        """
        with backend.transaction():
            project_issue_class = self._get_project_issue_class()
            backend.update(project_issue_class, {'enabled': False})
        return {'message': 'success'}, 200

    @valid_user(anon_ok=False)
    @valid_project(roles=('owner', 'admin'))
    @valid_issue_class
    def post(self, project_id, issue_class_id):
        """
        Add a new issue class to a project
        """
        with backend.transaction():
            project_issue_class = self._get_project_issue_class()
            if project_issue_class.pk:
                backend.update(project_issue_class, {'enabled': True})
            else:
                project_issue_class.enabled = True
                backend.save(project_issue_class)
        return {'message': 'success'}, 201
