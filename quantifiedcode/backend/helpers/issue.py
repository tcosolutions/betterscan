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
            for key, value in code_data.items():
                issue[key] = value
