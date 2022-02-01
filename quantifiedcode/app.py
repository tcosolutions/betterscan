# -*- coding: utf-8 -*-

"""

    Main QuantifiedCode app.

"""

from __future__ import unicode_literals
from __future__ import absolute_import

import sys
import re
import argparse
import urlparse

from flask import Flask,request
from werkzeug.wsgi import DispatcherMiddleware

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
        dest=u'host',
        nargs=u'?',
        default=u'0.0.0.0:5000',
    )

    args = parser.parse_args(sys.argv[1:])

    if u':' in args.host:
        host, port = args.host.split(':', 1)
        port = int(port)
    else:
        url = urlparse.urlparse(settings.get('url'))
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
