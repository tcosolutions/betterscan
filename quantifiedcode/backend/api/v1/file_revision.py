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
from quantifiedcode.backend.helpers.file_revision import get_file_content_by_sha

from ...decorators import valid_user, valid_project, valid_file_revision
from ...models import FileRevision
from ..resource import Resource

class FileRevisionContent(Resource):

    @staticmethod
    def get_content(file_revision, start=None, end=None):
        file_content = get_file_content_by_sha(request.project, file_revision['sha'])
        if start is not None or end is not None:
            return "\n".join(file_content.split("\n")[start:end])
        return file_content

    @staticmethod
    def get_file_revision(query):
        return backend.get(FileRevision, query, raw=True)

    @classmethod
    def get_and_process_content(cls, file_revision):

        start = 0
        end = None

        if 'end' in request.args:
            try:
                end = int(request.args['end'])
            except ValueError as err:
                err.message = "Invalid end"
                raise
        if 'start' in request.args:
            try:
                start = int(request.args['start'])
            except ValueError as err:
                err.message = "Invalid start"
                raise

        try:
            return {'content' : cls.get_content(file_revision, start, end),'start' : start,'end' : end}
        except IOError:
            return {'content' : None, 'start' : None, 'end' : None}

    @valid_user(anon_ok=True)
    @valid_project(public_ok=True)
    @valid_file_revision
    def get(self, project_id, file_revision_id=None,
            snapshot_id=None, path=None):
        try:
            data = {
                'code': self.get_and_process_content(request.file_revision),
                'pk': request.file_revision.pk,
                'project': request.project.pk,
            }
            return data, 200
        except ValueError as err:
            return {'message': err.message}, 500


class FileRevisionDetails(Resource):

    export_map = (
        'path',
        'pk',
        'type',
        'mode',
        'sha',
        'code',
        {
            'project': ['pk', 'name']
        },
        'created_at',
        'updated_at',
        {'results': '*'},
        'fr_pk',
        'language',
    )
    @valid_user(anon_ok=True)
    @valid_project(public_ok=True)
    @valid_file_revision
    def get(self, project_id, file_revision_id=None, snapshot_id=None, path=None):

        file_revision = request.file_revision
        if 'with_code' in request.args:
            try:
                file_revision.code = FileRevisionContent.get_and_process_content(file_revision)
            except ValueError as err:
                return {'message': err.message}, 500

        return {'file_revision': self.export(file_revision)}, 200
