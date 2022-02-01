# -*- coding: utf-8 -*-

"""

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

import re
import subprocess

from collections import defaultdict
from flask import request
from sqlalchemy.sql import text

from quantifiedcode.settings import backend

from ...utils.api import ArgumentError, get_pagination_args
from ...decorators import valid_user, valid_project, valid_snapshot
from ...models import Snapshot, Diff, FileRevision, Issue, IssueOccurrence, ProjectIssueClass

from ..resource import Resource
from .forms.snapshot import SnapshotFileRevisionIssuesForm, SnapshotSummaryForm, SnapshotIssuesSummaryForm

from .mixins.issue import FileRevisionIssueListMixin
from .file_revision import FileRevisionContent


from sqlalchemy.sql import (select,
                            func,
                            and_,
                            desc)


class SnapshotFileRevisionIssues(Resource, FileRevisionIssueListMixin):
    """
    Returns a list of file revisions with their issues.
    """

    @valid_user(anon_ok=True)
    @valid_project(raw=False, public_ok=True)
    @valid_snapshot(only=['pk', 'sha', 'snapshot'])
    def get(self, project_id, snapshot_id, path=None):

        form = SnapshotFileRevisionIssuesForm(request.args)

        if not form.validate():
          return {'message' : 'please correct the errors mentioned below', 'errors' : form.errors}, 400

        data = form.data

        analyzer_code = data['analyzer_code']
        limit, offset = data['limit'], data['offset']
        ignore = data['ignore']

        #we get the relevant tables from the backend
        snapshot_file_revisions_table = backend.get_table(Snapshot.fields['file_revisions'].relationship_class)
        fr_table = backend.get_table(FileRevision)
        issue_table = backend.get_table(Issue)
        issue_occurrence_table = backend.get_table(IssueOccurrence)
        project_issue_class_table = backend.get_table(ProjectIssueClass)
        issue_class_table = backend.get_table(request.project.IssueClass)
        project_pk_type = backend.get_field_type(request.project.fields['pk'])
        snapshot_pk_type = backend.get_field_type(Snapshot.fields['pk'])

        #we generate the path query
        path_query = []
        if path:
            if data['exact']:
                path_query = [fr_table.c.path == path]
            else:
                path_query = [fr_table.c.path.like(path+'%')]

        #we generate the analyzer-code query
        analyzer_code_query = []
        if analyzer_code:
            analyzer, code = analyzer_code
            analyzer_code_query = [
                issue_class_table.c.analyzer == analyzer,
                issue_class_table.c.code == code
            ]

        #we select all relevant issue classes for the project as a CTE
        issue_classes_cte = select([issue_class_table.c.analyzer,
                                    issue_class_table.c.code,
                                    (issue_class_table.c.analyzer + ':' + issue_class_table.c.code).label("analyzer_code")])\
                            .where(and_(
                                issue_class_table.c.pk.in_(
                                    select(
                                        [project_issue_class_table.c.issue_class]
                                        ).where(
                                            and_(project_issue_class_table.c.project == request.project.pk,
                                                 project_issue_class_table.c.enabled == True
                                                )
                                        )
                                    )
                                , *analyzer_code_query
                                )).cte()


        #we construct the table that we will select from
        fr_select_table = snapshot_file_revisions_table\
                       .join(fr_table, fr_table.c.pk == snapshot_file_revisions_table.c.filerevision)\
                       .join(issue_occurrence_table, issue_occurrence_table.c.file_revision == snapshot_file_revisions_table.c.filerevision)\
                       .join(issue_table, and_(issue_table.c.pk == issue_occurrence_table.c.issue, issue_table.c.ignore == ignore) )\
                       .join(issue_classes_cte, issue_classes_cte.c.analyzer_code == issue_table.c.analyzer + ':' + issue_table.c.code)\

        #we construct the file revisions query
        file_revisions_query = select([snapshot_file_revisions_table.c.filerevision])\
                               .select_from(fr_select_table)\
                               .where(and_(snapshot_file_revisions_table.c.snapshot == request.snapshot.pk, *path_query))\
                               .group_by(snapshot_file_revisions_table.c.filerevision, fr_table.c.path)\
                               .order_by(desc(fr_table.c.path))


        #we construct the count query
        count_query = select([func.count('*')])\
                      .alias(file_revisions_query)

        #we construct the table we will select issues from
        select_table = fr_table\
                       .join(issue_occurrence_table, issue_occurrence_table.c.file_revision == fr_table.c.pk)\
                       .join(issue_table, and_(issue_table.c.pk == issue_occurrence_table.c.issue, issue_table.c.ignore == ignore))\
                       .join(issue_classes_cte, issue_classes_cte.c.analyzer_code == issue_table.c.analyzer + ':' + issue_table.c.code)\


        #we construct the issues query
        issues_query = select([fr_table.c.pk.label('file_revision_pk'),
                               fr_table.c.path.label('path'),
                               fr_table.c.language.label('language'),
                               fr_table.c.sha.label('sha'),
                               issue_table.c.pk.label('issue_pk'),
                               issue_table.c.analyzer.label('analyzer'),
                               issue_table.c.code.label('code'),
                               issue_table.c.data.label('data'),
                               issue_table.c.ignore.label('ignore'),
                               issue_table.c.ignore_reason.label('ignore_reason'),
                               issue_table.c.ignore_comment.label('ignore_comment'),
                               issue_occurrence_table.c.pk.label('issue_occurrence_pk'),
                               issue_occurrence_table.c.from_row.label('from_row'),
                               issue_occurrence_table.c.to_row.label('to_row'),
                               issue_occurrence_table.c.from_column.label('from_column'),
                               issue_occurrence_table.c.to_column.label('to_column'),
                               issue_occurrence_table.c.sequence.label('sequence')
                               ])\
                       .select_from(select_table)\
                       .where(fr_table.c.pk.in_(file_revisions_query.limit(limit).offset(offset)))\
                       .order_by(fr_table.c.pk, issue_table.c.pk, issue_occurrence_table.c.pk)

        #we fetch the result
        with backend.transaction():
            rows = backend.connection.execute(issues_query).fetchall()
            count = backend.connection.execute(count_query).fetchone()[0]

        #we process the results
        results = self.process_file_revisions(request.project, rows)

        return {'file_revisions': results,
                'count': count
                }, 200

class SnapshotSummary(Resource):
    """
    Source: Project Backend
    """

    @valid_user(anon_ok=True)
    @valid_project(public_ok=True)
    @valid_snapshot(only=['pk', 'snapshot'], raw=False)
    def get(self, project_id, snapshot_id):

        form = SnapshotSummaryForm(request.args)

        if not form.validate():
          return {'message' : 'please correct the errors mentioned below', 'errors' : form.errors}, 400

        data = form.data

        analyzers = data['analyzers']
        language = data['language']

        summary = request.snapshot.get('summary', {})

        if language not in summary:
            return {'message': 'not found'}, 404

        for key in [key for key in summary.keys() if key != language]:
            del summary[key]

        for key in [key for key in summary[language].keys() if key not in analyzers]:
            del summary[language][key]

        return {'summary': summary}, 200


class SnapshotIssuesSummary(Resource):
    """
    Source: Project Backend
    """

    @valid_user(anon_ok=True)
    @valid_project(public_ok=True)
    @valid_snapshot(only=('pk',),include=('project',),raw=False)
    def get(self, project_id, snapshot_id):

        form = SnapshotIssuesSummaryForm(request.args)

        if not form.validate():
          return {'message' : 'please correct the errors mentioned below', 'errors' : form.errors}, 400

        data = form.data

        return {'summary': request.snapshot.summarize_issues(include_filename=data['with_files'], ignore=data['ignore'])}, 200


class SnapshotDetails(Resource):

    export_map = [
        'analyzed',
        'pk',
    ]

    includes = []
    only = {'summary' : False}

    @valid_user(anon_ok=True)
    @valid_project(public_ok=True)
    @valid_snapshot(only=only, include=includes, raw=False)
    def get(self, project_id, snapshot_id):
        exported_snapshot = self.export(request.snapshot)
        return {'snapshot': exported_snapshot}, 200


class SnapshotFileRevisionContent(FileRevisionContent):

    @valid_user(anon_ok=True)
    @valid_project(public_ok=True)
    @valid_snapshot
    def get(self, project_id, snapshot_id, path):
        query = {'pk': {'$in': [fr['pk'] for fr in request.snapshot.file_revisions]}, 'path': path}

        file_revision = self.get_file_revision(query)
        return self.get_and_process_content(file_revision), 200
