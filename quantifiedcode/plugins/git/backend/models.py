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
