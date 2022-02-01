# -*- coding: utf-8 -*-

"""

    Contains implementation of the project details resource for the GitHub plugin.

"""

from __future__ import unicode_literals
from __future__ import print_function

import logging

from datetime import datetime
from flask import request

from quantifiedcode.settings import backend
from quantifiedcode.backend.api.resource import Resource
from quantifiedcode.backend.decorators import valid_user, valid_project
from quantifiedcode.backend.utils.api import ArgumentError, get_pagination_args
from quantifiedcode.backend.models import Diff

from ....models import GitSnapshot
from ..forms.git_snapshots import GitSnapshotsForm
from quantifiedcode.backend.models import DiffIssueOccurrence, IssueOccurrence, Issue

from sqlalchemy.sql import select, and_, func

def analyzed(snapshot):
    if snapshot.get('snapshot') and snapshot['snapshot']['analyzed']:
        return {'analyzed': True}
    return {'analyzed': False}

class GitSnapshots(Resource):

    """
    Source: Git repository
    """

    export_map = (
        'committer_name',
        analyzed,
        'author_date',
        'author_date_ts',
        'author_email',
        'author_name',
        'author_initials',
        'branch',
        'committer_date',
        'committer_date_ts',
        {'diff': ['pk', 'issues_added', 'issues_fixed', 'pk_a', 'pk_b']},
        'base_snapshot',
        'committer_email',
        'committer_name',
        'committer_initials',
        'log',
        'pk',
        'sha',
        'tree_sha',
    )

    @staticmethod
    def get_diff_issue_stats(diffs):
        """
        Gets stats for the diffs returned by the given queryset. Determines which commit shas are being diffed,
        and issues added and fixed between sha a and sha b.

        To do: move this to checkmate.
        
        :param diffs: queryset which specifies the diffs
        :return: list of objects with pk, issues_added, issues_fixed, sha_a, sha_b keys
        
        """
        project = request.project
        diff_table = diffs.as_table()
        diff_issue_occurrence_table = backend.get_table(DiffIssueOccurrence)

        # only select issues whose issue classes are enabled for the project
        issue_class_table = project.get_issue_classes(enabled=True, backend=backend, only=('analyzer', 'code')).as_table()

        issue_occurrence_table = backend.get_table(IssueOccurrence)
        issue_table = backend.get_table(Issue)

        git_snapshot_table = backend.get_table(GitSnapshot)
        git_snapshot_table_a = git_snapshot_table.alias()
        git_snapshot_table_b = git_snapshot_table.alias()

        table = (diff_table
                 .join(diff_issue_occurrence_table, diff_issue_occurrence_table.c.diff == diff_table.c.pk)
                 .join(issue_occurrence_table)
                 .join(issue_table)
                 .join(issue_class_table, and_(issue_table.c.analyzer == issue_class_table.c.analyzer,
                                               issue_table.c.code == issue_class_table.c.code,
                                               issue_table.c.ignore == False))
                 .join(git_snapshot_table_a, git_snapshot_table_a.c.snapshot == diff_table.c.snapshot_a)
                 .join(git_snapshot_table_b, git_snapshot_table_b.c.snapshot == diff_table.c.snapshot_b))

        sha_a = git_snapshot_table_a.c.sha.label('sha_a')
        sha_b = git_snapshot_table_b.c.sha.label('sha_b')

        s = (select([sha_a, sha_b, diff_table.c.pk, diff_issue_occurrence_table.c.key, func.count('*').label('cnt')])
             .select_from(table)
             .group_by(diff_issue_occurrence_table.c.key, diff_table.c.pk, sha_a, sha_b))

        with backend.transaction():
            results = backend.connection.execute(s).fetchall()

        diffs_by_pk = {}
        for row in results:
            if row['pk'] not in diffs_by_pk:
                diffs_by_pk[row['pk']] = {'pk': row['pk']}
            diffs_by_pk[row['pk']]['issues_{}'.format(row['key'])] = row['cnt']
            diffs_by_pk[row['pk']]['sha_a'] = row['sha_a']
            diffs_by_pk[row['pk']]['sha_b'] = row['sha_b']

        for diff in diffs_by_pk.values():
            for key in ('issues_fixed', 'issues_added'):
                if key not in diff:
                    diff[key] = 0

        return diffs_by_pk.values()

    @valid_user(anon_ok=True)
    @valid_project(public_ok=True)
    def get(self, project_id, remote, branch_name):

        form = GitSnapshotsForm(request.args)

        if not form.validate():
            return {
                'message' : 'please correct the errors mentioned below',
                'errors' : form.errors
            }, 400

        data = form.data

        snapshots = request.project.git.get_snapshots(
            branch=remote + "/" + branch_name, limit=data['limit'], offset=data['offset'])[::-1]

        shas = [snapshot.sha for snapshot in snapshots]

        if data['annotate'] and shas:
            analyzed_snapshots = backend.filter(GitSnapshot,
                                                {'snapshot.project': request.project,
                                                 'sha': {'$in': shas}},
                                                raw=True,
                                                include=(('snapshot', 'pk', 'analyzed'),),
                                                only=GitSnapshots.export_fields)
            diffs = backend.filter(Diff, {
                '$or': [
                    {'$and': [{'snapshot_a.git_snapshot.sha': sha_a},
                              {'snapshot_b.git_snapshot.sha': sha_b}]}
                    for sha_a, sha_b in zip(shas[1:], shas[:-1])
                    ]
            })
            diff_stats = self.get_diff_issue_stats(diffs)
            analyzed_snapshots_by_sha = {snapshot['sha'] : snapshot
                                        for snapshot in analyzed_snapshots}
            for diff in diff_stats:
                if diff['sha_b'] in analyzed_snapshots_by_sha:
                    analyzed_snapshots_by_sha[diff['sha_b']]['diff'] = diff
            annotated_snapshots = []
            for snapshot in snapshots:
                if snapshot['sha'] in analyzed_snapshots_by_sha:
                    annotated_snapshots.append(
                        analyzed_snapshots_by_sha[snapshot['sha']])
                else:
                    annotated_snapshots.append(snapshot)
        else:
            annotated_snapshots = snapshots

        serialized_snapshots = [self.export(snp)
                                for snp in annotated_snapshots]
        try:
            snapshot_count = request.project.git.repository.get_number_of_commits(
                remote +
                '/' +
                branch_name)
        except subprocess.CalledProcessError as e:
            snapshot_count = len(serialized_snapshots)
        return {'snapshots': serialized_snapshots,
                'count': snapshot_count}, 200
