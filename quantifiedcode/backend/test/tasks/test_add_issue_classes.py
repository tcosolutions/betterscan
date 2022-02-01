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
