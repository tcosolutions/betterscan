# -*- coding: utf-8 -*-

"""

    Contains API utilities.

"""

from __future__ import unicode_literals
from __future__ import print_function

from quantifiedcode.settings import settings

import logging
logger = logging.getLogger(__name__)


class ArgumentError(BaseException):

    def __init__(self, message="Argument error", error_code=400):
        self.message = message
        self.error_code = error_code

def handle_exception(e):
    """ Handles exceptions thrown while running the application.
    :param e: exception object
    :return: Flask response
    """
    logger.error(traceback.format_exc())

    data = {
        'message': "Sorry, an unexpected exception occurred. Our tech staff got notified automatically and will try "
                   "to solve this problem as fast as possible.",
        'details': str(e),
    }
    response = jsonify(data)
    response.status_code = e.status_code if hasattr(e, 'status_code') else 500

    return response


def register_routes(routes, app, module=None, version=None):
    """ Register the given routes under the given module name and version.
    """
    views = {}
    resources = {}
    logger.debug("Registering routers for module {} version {}".format(module or "", version or ""))
    # Register all routes
    for route in routes:
        for route_url, (resource_class, options) in route.items():

            identifier = "{}.{}".format(module, resource_class.__name__) if module else resource_class.__name__
            versioned_url = "/" + version + route_url if version else route_url

            resource = resources.get(identifier)
            if not resource:
                resource = resources[identifier] = resource_class()
                if hasattr(resource_class, 'export_map'):
                    if isinstance(resource_class.export_map, list):
                        resource_class.export_map += settings.get_plugin_exports(identifier)
                if hasattr(resource_class, 'includes'):
                    if isinstance(resource_class.includes, list):
                        resource_class.includes += settings.get_plugin_includes(identifier)

            view = views.get(identifier)
            if not view:
                view = views[identifier] = resource.as_view(str(identifier))

            app.add_url_rule(
                versioned_url,
                view_func=view,
                methods=options.get('methods', ['GET']) + ['OPTIONS']
            )

def get_pagination_args(request):
    """ Retrieves pagination arguments from the given Flask request object. Supports
     `offset`, `page`, and `limit` arguments, with offset and page being exclusive.
    :param request: Flask request object
    :return: pagination arguments
    """
    args = {}

    for arg_name in ('offset', 'page', 'limit'):
        if arg_name in request.args:

            try:
                arg_value = int(request.args[arg_name]) if request.args[arg_name] != "" else 0
                if arg_value < 0:
                    raise ValueError()
                args[arg_name] = arg_value
            except ValueError:
                raise ArgumentError("Invalid " + arg_name, 400)

    if 'offset' in args and 'page' in args:
        raise ArgumentError("Offset and page parameters can not be combined.", 400)

    for arg_name in ('before', 'after'):
        if request.args.get(arg_name):
            try:
                args[arg_name] = int(request.args[arg_name])
            except ValueError():
                raise ArgumentError("Invalid {} parameter".format(arg_name), 400)
    return args
