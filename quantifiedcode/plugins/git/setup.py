# -*- coding: utf-8 -*-

"""

    Contains information needed to set up the plugin.

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

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

