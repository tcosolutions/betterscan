# -*- coding: utf-8 -*-

from __future__ import unicode_literals

def enrich_issues(issues, issues_data):
    for issue in issues:
        language = issue['file_revision'].get('language')
        if language and language in issues_data:
            analyzer = issue['analyzer']
            enrich_issue(issue, language, analyzer, issues_data)
    return issues

def enrich_issue(issue, language, analyzer, issues_data):
    language_data = issues_data.get(language)
    if not language_data:
        return
    analyzers_data = language_data['analyzers']
    if language_data and analyzer in analyzers_data:
        analyzer_data = analyzers_data[analyzer]
        code = issue['code']
        code_data = analyzer_data['codes'].get(code)
        if code_data:
            for key, value in code_data.iteritems():
                issue[key] = value
