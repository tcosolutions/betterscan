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

"""

    Contains information needed to set up the plugin.

"""





from .backend.tasks import hooks
from .backend.models import GitRepository, GitSnapshot, GitBranch
from .backend.api.v1.routes import routes
from .backend.providers.snapshot import resolve
from .backend.providers.file_content import get_file_content_by_sha

import os

plugin_path = os.path.dirname(__file__)

config = {
    'api': {
        'version': 'v1',
        'routes': routes,
        'module': 'git',
    },
    'providers' : {
        'snapshot.resolve' : {
            'source' : 'git',
            'provider' : resolve
        },
        'file_revision.content_by_sha' : {
            'source' : 'git',
            'provider' : get_file_content_by_sha
        }
    },
    'models': [GitRepository, GitSnapshot, GitBranch],
    #we declare an additional template directory
    'settings' : {
        'backend' : {
            'template_paths' : {
                '200_git' : os.path.join(plugin_path, 'backend/templates')
            }
        }
    },
    'yaml_settings' : [os.path.join(plugin_path,'settings/default.yml')],
    'frontend' : {
        'static_files' : os.path.join(plugin_path,'frontend/build/static'),
        'optimized_static_files' : os.path.join(plugin_path,'frontend/build/optimized/static'),
        'settings' : {
            'settingsModule' : 'git/settings'
        }
    },
    'tasks': [],
    'exports' : {
        'ProjectDetails' : (
            {
                'git' : ('public_key',
                         'url'
                        )},
            {
                'git_branches' : {'*' : ('name', 'remote',{'head_snapshot' : ('pk',)},{'last_analyzed_snapshot' : ('pk',)})}
            }
        ),
        'SnapshotDetails' : (
            {
                'git_snapshot' : (
                    'sha',
                    'hash',
                    'committer_date',
                    'author_date',
                    'author_name',
                    'committer_date_ts',
                    'author_date_ts',
                    'tree_sha',
                    'log',
                    ),
            },
            {
                'branch' : ('name',)
            }
            )
    },
    'includes' : {
        'ProjectDetails' : ['git','git_branches'],
        'SnapshotDetails' : ['git_snapshot']
    },
    'hooks': hooks,
    'name': 'Git',
    'requires': [],  # e.g. git v1
    'description': "Currently only register Git hooks"
}

