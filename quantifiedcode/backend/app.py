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

    Implements the main application.

"""





import traceback

from flask import Flask, jsonify

from quantifiedcode.settings import settings
from quantifiedcode.backend.settings import BACKEND_PATH

from .utils import RegexConverter
from .utils.api import register_routes, handle_exception
from .api.v1 import routes as routes_v1

def get_app(settings):

    app = Flask(__name__,
                static_url_path="/static",
                static_folder="{}/static".format(BACKEND_PATH),
                template_folder="{}/templates".format(BACKEND_PATH))
    app.url_map.converters['regex'] = RegexConverter
    app.handle_exception = handle_exception
    configure(app, settings)

    return app

def configure(app, settings):
    register_routes(routes_v1, app)
    for name, api in list(settings.get_plugin_apis().items()):
        register_routes(api['routes'], app, module=name, version=api['version'])

if __name__ == "__main__":
    app = get_app(settings)
    app.run(debug=settings.get('debug', False), host="0.0.0.0", threaded=False)
