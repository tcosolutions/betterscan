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
from quantifiedcode.test.helpers import DatabaseTest
from quantifiedcode.test.fixtures.project import simple_project
from quantifiedcode.backend.models import Project, Tag, IssueClass, ProjectIssueClass


class TestAddIssueClasses(DatabaseTest):
    """
    Tests adding issue classes to a given project based on the project tags...
    """

    fixtures = [
        {
            'project': simple_project
        }
    ]

    models = [ProjectIssueClass, IssueClass, Tag, Project]

    def test_issue_classes(self):
        tag_foo = Tag({'name': 'foo'})
        tag_bar = Tag({'name': 'bar'})

        issue_class = IssueClass({
            'analyzer': 'test',
            'code': 'test',
            'tags': [tag_foo, tag_bar]
        })

        project_issue_class = ProjectIssueClass({
            'project': self.project,
            'issue_class': issue_class,
            'enabled': True
        })

        assert len(self.project.project_issue_classes) == 0

        with self.backend.transaction():
            self.backend.save(tag_foo)
            self.backend.save(tag_bar)
            self.backend.save(issue_class)

        assert len(self.backend.filter(IssueClass, {'project_issue_classes.project': self.project})) == 0

        with self.backend.transaction():
            self.backend.save(project_issue_class)

        # we revert the issue classes to the database state...
        self.project.project_issue_classes.revert()

        assert len(self.project.project_issue_classes) == 1

        assert len(self.backend.filter(IssueClass, {'project_issue_classes.project': self.project})) == 1
        assert len(self.backend.filter(IssueClass, {
            '$and': [
                {'project_issue_classes.project': self.project, 'project_issue_classes.enabled': True},
                {'tags.name': {'$all': ['foo', 'bar']}}
            ]})) == 1
