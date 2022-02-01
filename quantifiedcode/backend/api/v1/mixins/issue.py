# -*- coding: utf-8 -*-

"""

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

import re
import logging
import json

from flask import request
from sqlalchemy.sql import select, func, and_, expression, exists

from quantifiedcode.settings import backend
from quantifiedcode.backend.models import Issue, FileRevision, ProjectIssueClass, IssueOccurrence
from quantifiedcode.backend.utils.api import ArgumentError, get_pagination_args
from quantifiedcode.backend.helpers.file_revision import get_file_content_by_sha


logger = logging.getLogger(__name__)

def add_code_snippets(project, file_revision, issue_occurrences):
    try:
        file_content = get_file_content_by_sha(project, file_revision['sha'])
        lines = file_content.split("\n")
    except IOError:
        raise
        # in case of encoding error just append the issues without snippets
        # the frontend is able to handle this.
        return
    except (LookupError, UnicodeDecodeError, IOError):
        return

    for occurrence in issue_occurrences:
        if not occurrence['from_row'] and not occurrence['to_row']:
            occurrence['snippet'] = ['', 1, 1]
            continue
        start = max(0, occurrence['from_row'] - 3)
        stop = min(len(lines), occurrence['to_row'] + 2)
        occurrence['snippet'] = {'code': "\n".join(lines[start: stop]),
                                 'from': start + 1,
                                 'to': stop + 1
                                 }

class IssueListMixin(object):
    """
    Returns a list of issues with their file revisions.

    Will always return one entry for a given issue + file revision.
    """

    @staticmethod
    def process_issues(project, results):

        issues = []
        issue = None
        for row in results:
            if issue is None or issue['pk'] != row['issue_pk'] \
                    or issue['file_revision']['pk'] != row['file_revision_pk']:
                if issue is not None and request.args.get('with_code'):
                    add_code_snippets(project, issue['file_revision'], issue['occurrences'])
                issue = {'pk': row['issue_pk'],
                         'analyzer': row['analyzer'],
                         'code': row['code'],
                         'ignore' : row['ignore'],
                         'ignore_reason' : row['ignore_reason'],
                         'ignore_comment' : row['ignore_comment'],
                         'file_revision': {
                             'path': row['path'],
                             'language': row['language'],
                             'sha': row['sha'],
                             'pk': row['file_revision_pk'],
                         },
                         'occurrences': []
                         }
                issue.update(json.loads(row['data']))
                issues.append(issue)
            issue_occurrence = {
                'pk': row['issue_occurrence_pk'],
                'from_column': row['from_column'],
                'to_column': row['to_column'],
                'from_row': row['from_row'],
                'to_row': row['to_row'],
                'sequence': row['sequence']
            }
            issue['occurrences'].append(issue_occurrence)

        # we add the code snippets to the last issue (as it wasn't done above)
        if issues and request.args.get('with_code'):
            add_code_snippets(project, issue['file_revision'], issue['occurrences'])

        return issues


class FileRevisionIssueListMixin(object):
    """ Returns a list of file revisions with their issues.
    """

    @staticmethod
    def process_file_revisions(project, results):

        file_revisions = []
        file_revision = None
        issue = None
        for row in results:

            if request.args.get('with_code'):
                if ((issue is not None and issue['pk'] != row['issue_pk']) or
                        (file_revision is not None and file_revision['pk'] != row['file_revision_pk'])):
                    add_code_snippets(project, file_revision, issue['occurrences'])

            if file_revision is None or file_revision['pk'] != row['file_revision_pk']:
                file_revision = {
                    'pk': row['file_revision_pk'],
                    'path': row['path'],
                    'language': row['language'],
                    'sha': row['sha'],
                    'issues': [],
                }
                issue = None
                file_revisions.append(file_revision)

            if issue is None or issue['pk'] != row['issue_pk']:
                issue = {
                    'pk': row['issue_pk'],
                    'analyzer': row['analyzer'],
                    'code': row['code'],
                    'ignore' : row['ignore'],
                    'ignore_reason' : row['ignore_reason'],
                    'ignore_comment' : row['ignore_comment'],
                    'occurrences': [],
                }
                issue.update(json.loads(str(row['data'])))
                file_revision['issues'].append(issue)

            issue_occurrence = {
                'pk': row['issue_occurrence_pk'],
                'from_column': row['from_column'],
                'to_column': row['to_column'],
                'from_row': row['from_row'],
                'to_row': row['to_row'],
                'sequence': row['sequence'],
            }
            issue['occurrences'].append(issue_occurrence)

        # we add the code snippets to the last file revision (as it wasn't done above in the loop)
        if request.args.get('with_code') and file_revisions:
            add_code_snippets(project, file_revision, issue['occurrences'])

        return file_revisions
