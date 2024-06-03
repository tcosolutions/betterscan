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

"""





from flask import request

from quantifiedcode.settings import backend
from quantifiedcode.backend.models import Issue

from ...decorators import valid_project, valid_user, valid_issue
from ..resource import Resource
from .forms.issue_status import IssueStatusForm
import pdb
import pprint

def remove_duplicate_issues(data):
    """
    Removes duplicate entries where 'file' and 'line' key repeats in both 'checkov' and 'tfsec' analyzers.

    :param data: The input data, expected to be a dictionary with nested structure containing 'analyzers'.
    :return: A dictionary with duplicates removed for 'checkov' and 'tfsec' analyzers.
    """
    # Extract analyzers data
    analyzers = data.get('all', {}).get('analyzers', {})

    # Collect seen file-line pairs
    seen = set()

    # Function to process each analyzer's codes
    def process_codes(codes):
        unique_codes = {}
        for code, details in codes.items():
            file_line_pair = (details.get('file'), details.get('line'))
            if file_line_pair not in seen:
                seen.add(file_line_pair)
                unique_codes[code] = details
        return unique_codes

    # Process each analyzer
    for analyzer, analyzer_data in analyzers.items():
        codes = analyzer_data.get('codes', {})
        analyzers[analyzer]['codes'] = process_codes(codes)

    return data



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
                            'file',
                            'line'
                        )}
                    },
                )}
            }
        )},
    )

    @valid_user(anon_ok=True)
    @valid_project(public_ok=True)
    def get(self, project_id=None):
        project_issues_data = remove_duplicate_issues(request.project.get_issues_data())
        
        # project_issues_data = request.project.get_issues_data()
        #pprint.pprint(project_issues_data)



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

