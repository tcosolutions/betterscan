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

"""

    Contains information needed to set up the plugin.

"""




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
