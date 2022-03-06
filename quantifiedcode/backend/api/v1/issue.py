# -*- coding: utf-8 -*-

"""

"""





from flask import request

from quantifiedcode.settings import backend
from quantifiedcode.backend.models import Issue

from ...decorators import valid_project, valid_user, valid_issue
from ..resource import Resource
from .forms.issue_status import IssueStatusForm
import pdb
import pprint


class IssuesData(Resource):

    export_map = (
        {'*': (
            'title',
            {'analyzers':
                {'*': (
                    'title',
                    {'codes':
                        {'*': (
                            'pk',
                            'title',
                            'severity',
                            'description',
                            'categories',
                            'autofix_name',
                        )}
                    },
                )}
            }
        )},
    )

    @valid_user(anon_ok=True)
    @valid_project(public_ok=True)
    def get(self, project_id=None):
        project_issues_data = request.project.get_issues_data()
        return {'issues_data': self.export(project_issues_data)}, 200

class IssueStatus(Resource):

    """
    Marks a given issue as ignored/not ignored.
    """

    @valid_user(anon_ok=True)
    @valid_project()
    @valid_issue
    def put(self, project_id, issue_id):
        
        form = IssueStatusForm(request.form)

        if not form.validate():
            return {
                'message' : 'Please correct the errors mentioned below.',
                'errors' : form.errors
            }, 400

        with backend.transaction():
            backend.update(request.issue,form.data)

        return {'message' : 'success'}, 200
