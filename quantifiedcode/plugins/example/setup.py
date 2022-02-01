# -*- coding: utf-8 -*-

"""

    Contains information needed to set up the plugin.

"""

from __future__ import unicode_literals
from __future__ import print_function

from .backend.api.v1.routes import routes
from .backend.tasks import hooks
from .backend.exports import exports
from .backend.includes import includes

config = {
    'api': {
        'version': 'v1',
        'routes': routes,
        'module': '{{module_name}}',
    },
    'hooks': hooks,
    'includes': includes,
    'exports': exports,
    'name': '{{name}}',
    'requires': [],  # e.g. git v1
    'description': "{{description}}"
}
