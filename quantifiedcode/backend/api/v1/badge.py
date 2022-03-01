# -*- coding: utf-8 -*-

"""

    Implements the QuantifiedCode badge image.

"""




from flask import Response, request

from quantifiedcode.backend.settings.jinja import jinja_env
from quantifiedcode.backend.models import Snapshot
from quantifiedcode.backend.decorators import valid_user, valid_project
from quantifiedcode.backend.helpers.snapshot import get_snapshot
from quantifiedcode.backend.helpers.issue import enrich_issue

from ..resource import Resource

class Badge(Resource):

    @valid_user(anon_ok=True)
    @valid_project(private_ok=True, only=None)
    def get(self, project_id, snapshot_id=""):
        """ Returns the badge for the specified project and snapshot.
        :param project_id: id of the project
        :param snapshot_id: id of the snapshot
        :return: badge image
        """
        project = request.project

        try:
            snapshot = get_snapshot(project, snapshot_id, raw=False, include=('project',))
            issues_summary = snapshot.summarize_issues()
            issues = issues_summary.get('', {})
        except (Snapshot.DoesNotExist, KeyError):
            # no issues, return empty badge
            return Response(jinja_env.get_template('badge_empty.svg').render(), mimetype="image/svg+xml")

        critical_issues_count = 0
        potential_bugs_count = 0
        minor_issues_count = 0
        recommendations_count = 0

        issues_data = project.get_issues_data()

        # mimic `generateIssuesFromSnapshotSummary` (from `helpers/issue.js`)
        for language, language_data in issues.items():
            if not language:
                continue

            for analyzer, analyzer_data in language_data.items():
                if not analyzer:
                    continue

                for code, error_count in analyzer_data.items():
                    issue = {'code': code}
                    enrich_issue(issue, language, analyzer, issues_data)

                    if not issue.get('severity'):
                        continue

                    severity = issue['severity']

                    if severity == 1:
                        critical_issues_count += error_count[1]
                    elif severity == 2:
                        potential_bugs_count += error_count[1]
                    elif severity == 3:
                        minor_issues_count += error_count[1]
                    elif severity == 4:
                        recommendations_count += error_count[1]

        elements = sum([1 for i in (critical_issues_count,
                                    potential_bugs_count,
                                    minor_issues_count,
                                    recommendations_count) if i])

        context = {
            'elements' : elements,
            'critical_issues': critical_issues_count,
            'potential_bugs': potential_bugs_count,
            'minor_issues': minor_issues_count,
            'recommendations': recommendations_count,
        }
        
    
        body = jinja_env.get_template('badge.svg').render(**context)
        return Response(body, mimetype="image/svg+xml")
