import os

from blitzdb.fields import TextField, CharField, DateTimeField, IntegerField
from checkmate.contrib.plugins.git.models import (GitRepository as BaseGitRepository,
                                                  GitSnapshot,
                                                  GitBranch)

class GitRepository(BaseGitRepository):

    public_key = TextField()
    private_key = TextField()
    url = CharField(indexed=True)

    @property
    def path(self):
        #we import this here to avoid cyclic dependency problems (shouldn't be the case though)
        from quantifiedcode.settings import settings
        if not self.eager.project.eager.pk:
            raise AttributeError('You must define a primary key for the project in order to get the repository path!')
        path = os.path.join(settings.get('project_path'), settings.get('backend.paths.git_repositories'), self.pk)
        return path
