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

    Main QuantifiedCode app.

"""




import sys
import re
import argparse
import urllib.parse

from flask import Flask,request
#from werkzeug.wsgi import DispatcherMiddleware
from werkzeug.middleware.dispatcher import DispatcherMiddleware

from quantifiedcode.settings import settings, backend
from quantifiedcode.backend.app import get_app as get_backend_app
from quantifiedcode.frontend.app import get_app as get_frontend_app

"""
Run the backend and the frontend as a single Flask application.

You might need to change 'settings.js' in the frontend to accommodate for the
changed API URL.
"""

def get_app(settings):

    app = Flask(__name__)
    empty_app = Flask(__name__)
    app.wsgi_app = DispatcherMiddleware(empty_app, {
        '/api': get_backend_app(settings),
        settings.get('frontend.url') : get_frontend_app(settings),
    })

    return app

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument(
        dest='host',
        nargs='?',
        default='0.0.0.0:5000',
    )

    args = parser.parse_args(sys.argv[1:])

    if ':' in args.host:
        host, port = args.host.split(':', 1)
        port = int(port)
    else:
        url = urllib.parse.urlparse(settings.get('url'))
        if url.port:
            port = url.port
        else:
            port = 5000
        if url.hostname:
            host = url.hostname
        else:
            host = '0.0.0.0'

    settings.initialize(backend)
    app = get_app(settings)

    app.run(
        debug=settings.get('debug', False),
        host=host,
        port=port,
        processes=4,
        threaded = True, # False
        use_reloader=True
    )
