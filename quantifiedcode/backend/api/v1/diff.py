# -*- coding: utf-8 -*-

"""

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

from flask import request

from sqlalchemy.sql import text

from quantifiedcode.settings import backend
from quantifiedcode.backend.models import (FileRevision,
                                           IssueOccurrence,
                                           ProjectIssueClass,
                                           Diff,
                                           DiffIssueOccurrence,
                                           Issue,
                                           IssueClass)

from ...utils.api import get_pagination_args
from ...decorators import valid_user, valid_project, valid_diff

from ..resource import Resource
from .forms.diff import DiffIssuesSummaryForm, DiffFileRevisionIssuesForm

from .mixins.issue import FileRevisionIssueListMixin
from .snapshot import SnapshotDetails

from sqlalchemy.sql import (select,
                            func,
                            and_)

class DiffDetails(Resource):

    export_map = [
        'summary',
        {'snapshot_a': SnapshotDetails.export_map},
        {'snapshot_b': SnapshotDetails.export_map},
        'pk',
    ]

    includes = [('snapshot_a',SnapshotDetails.includes),
                ('snapshot_b', SnapshotDetails.includes)]

    @valid_user(anon_ok=True)
    @valid_project(raw=False, public_ok=True)
    def get(self, project_id, snapshot_a_id, snapshot_b_id):
        return {'diff': self.export(request.diff)}, 200


class DiffIssuesSummary(Resource):
    """
    Source: Project Backend
    """

    @valid_user(anon_ok=True)
    @valid_project(public_ok=True)
    @valid_diff
    def get(self, project_id, snapshot_a_id, snapshot_b_id):

        form = DiffIssuesSummaryForm(request.args)

        if not form.validate():
          return {'message' : 'please correct the errors mentioned below', 'errors' : form.errors}, 400

        data = form.data

        if data['with_files']:
            include_filename = True
        else:
            include_filename = False

        return {'summary': request.diff.summarize_issues(include_filename=include_filename)}, 200


class DiffFileRevisionIssues(Resource, FileRevisionIssueListMixin):
    """
    Returns a list of issues with their file revisions.

    Will always return one entry for a given issue + file revision.
    """

    @valid_user(anon_ok=True)
    @valid_project(raw=False, public_ok=True)
    @valid_diff
    def get(self, project_id, snapshot_a_id, snapshot_b_id, path=None):

        form = DiffFileRevisionIssuesForm(request.args)

        if not form.validate():
          return {'message' : 'please correct the errors mentioned below', 'errors' : form.errors}, 400

        data = form.data

        analyzer_code = data['analyzer_code']
        limit, offset = data['limit'], data['offset']

        #we get the relevant tables from the backend
        fr_table = backend.get_table(FileRevision)
        issue_table = backend.get_table(Issue)
        issue_occurrence_table = backend.get_table(IssueOccurrence)
        diff_issue_occurrence_table = backend.get_table(DiffIssueOccurrence)
        project_issue_class_table = backend.get_table(ProjectIssueClass)
        issue_class_table = backend.get_table(request.project.IssueClass)
        project_pk_type = backend.get_field_type(request.project.fields['pk'])
        diff_pk_type = backend.get_field_type(Diff.fields['pk'])

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

        issue_type_query = []
        if data['issue_type'] in ('fixed', 'added'):
            issue_type_query = [diff_issue_occurrence_table.c.key == data['issue_type']]

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

        select_table = fr_table\
                       .join(issue_occurrence_table, issue_occurrence_table.c.file_revision == fr_table.c.pk)\
                       .join(diff_issue_occurrence_table,
                                and_(diff_issue_occurrence_table.c.diff == request.diff.pk,
                                     diff_issue_occurrence_table.c.issue_occurrence == issue_occurrence_table.c.pk,
                                     *issue_type_query))\
                       .join(issue_table, issue_table.c.pk == issue_occurrence_table.c.issue)\
                       .join(issue_classes_cte, issue_classes_cte.c.analyzer_code == issue_table.c.analyzer + ':' + issue_table.c.code)\

        #we construct the table we will select issues from
        file_revision_query = select([fr_table.c.pk])\
                              .select_from(select_table)\
                              .where(and_(*path_query))\
                              .group_by(fr_table.c.pk)\
                              .order_by(fr_table.c.path)

        #we construct the count query
        count_query = select([func.count('*')])\
                      .select_from(file_revision_query)

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
                       .where(fr_table.c.pk.in_(file_revision_query.limit(limit).offset(offset)))\
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

