# -*- coding: utf-8 -*-

"""

    Implements the main application.

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

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
    for name, api in settings.get_plugin_apis().items():
        register_routes(api['routes'], app, module=name, version=api['version'])

if __name__ == "__main__":
    app = get_app(settings)
    app.run(debug=settings.get('debug', False), host="0.0.0.0", threaded=False)
