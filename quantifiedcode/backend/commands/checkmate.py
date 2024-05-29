/*
 * This file is part of Betterscan CE (Community Edition).
 *
 * Betterscan is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Betterscan is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Betterscan. If not, see <https://www.gnu.org/licenses/>.
 *
 * Originally licensed under the BSD-3-Clause license with parts changed under
 * LGPL v2.1 with Commons Clause.
 * See the original LICENSE file for details.
*/
# -*- coding: utf-8 -*-


import click
import logging

logger = logging.getLogger(__name__)

from quantifiedcode.settings import backend, settings
from quantifiedcode.backend.models import IssueClass, IssueCategory, Tag

@click.group("checkmate")
def checkmate():
    """
    Checkmate-related commands.
    """

@checkmate.command("import-issue-classes")
def import_issue_classes():
    _import_issue_classes()

def _import_issue_classes():

    issue_update_keys = ('severity', 'description', 'title', 'file', 'line')
    analyzer_update_keys = ('language',)

    logger.info("Importing issue classes from checkmate...")
    analyzers = settings.checkmate_settings.analyzers
    for analyzer, params in list(analyzers.items()):
        logger.info("Importing issue classes for analyzer {}".format(analyzer))
        if not all([key in params for key in analyzer_update_keys]):
            logger.warning("Skipping analyzer {} as it does not contain a '{}' field".format(key))
            continue
        for code, issue_params in list(params.get('issues_data',{}).items()):
            if not all([key in issue_params for key in issue_update_keys]):
                logger.warning("Skipping issue class for code {}, as it does not contain a '{}' field".format(code, key))
                continue
            logger.info("Importing issue class for code {}".format(code))
            try:
                issue_class = backend.get(IssueClass,{'analyzer' : analyzer, 'code' : code})
            except IssueClass.DoesNotExist:
                issue_class = IssueClass({
                    'analyzer' : analyzer,
                    'code' : code,
                    })
            for key in issue_update_keys:
                issue_class[key] = issue_params[key]
            for key in analyzer_update_keys:
                issue_class[key] = params[key]
            with backend.transaction():
                backend.save(issue_class)
                issue_class.categories.delete()
            for category in issue_params.get('categories',[]):
                try:
                    issue_category = backend.get(IssueCategory,{'name' : category})
                except IssueCategory.DoesNotExist:
                    issue_category = IssueCategory({'name' : category})
                    with backend.transaction():
                        backend.save(issue_category)
                issue_class.categories.append(issue_category)
            for tag_name in issue_params.get('tags',['generic']):
                try:
                    tag = backend.get(Tag,{'name' : tag_name})
                except Tag.DoesNotExist:
                    tag = Tag({'name' : tag_name})
                    with backend.transaction():
                        backend.save(tag)
                issue_class.tags.append(tag)
            with backend.transaction():
                backend.save(issue_class)
 
