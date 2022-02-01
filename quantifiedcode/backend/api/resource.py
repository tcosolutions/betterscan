# -*- coding: utf-8 -*-

"""

    Implements Resource

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

import traceback
import time
import hashlib
import logging
import werkzeug.exceptions

from flask import jsonify, request, Response, make_response
from flask.views import View
from six import string_types

from quantifiedcode.settings import backend, settings

from ..utils import export

logger = logging.getLogger(__name__)


class NotModified(werkzeug.exceptions.HTTPException):
    """ Represents a NotModified exception
    """

    code = 304

    @staticmethod
    def get_response(environment):
        return Response(status=304)


class classproperty(property):
    def __get__(self, cls, owner):
        return classmethod(self.fget).__get__(None, owner)()


class Resource(View):
    """
    A generic resource class.

    The `export_map` variable contains a mapping that can be used by the `export` function to export
    the desired fields to a dictionary suitable for serialization.

    The class also provides an `export_fields` class property that can be used to generate a list of
    fields contained in the export map (which could contain dicts or tuples as well), e.g. for used
    as the `only` parameter.
    """

    name = None
    crossdomain = None

    @classmethod
    def export(cls, obj):
        return export(obj, settings.get_export_map(cls))

    def dispatch_request(self, *args, **kwargs):
        return self.handle(request.method, *args, **kwargs)

    @staticmethod
    def make_response(data):
        if isinstance(data, string_types) or isinstance(data, Response):
            return data
        return jsonify(data)

    @classproperty
    def export_fields(cls):
        export_map = settings.get_export_map(cls)
        export_fields = [field for field in export_map if isinstance(field, string_types)]
        export_fields += [subfield for field in export_map if isinstance(field, dict) for subfield in field.keys()]
        return export_fields

    @staticmethod
    def add_cache_headers(response):
        digest = hashlib.sha1()
        digest.update(response.get_data())
        hexdigest = digest.hexdigest()
        if 'if-none-match' in request.headers:
            etag = request.headers['if-none-match']
            # remove quotation marks if present
            if etag[0] == '"' and etag[-1] == '"':
                etag = etag[1:-1]
            # Apache adds a "-gzip" suffix, if it compressed
            # the JSON on the fly; strip this suffix if it exists
            if etag[-5:] == "-gzip":
                etag = etag[:-5]
            if etag == hexdigest:
                raise NotModified

        # Cache headers:
        # http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
        #   * private => do not cache in intermediary caches but only in the browser since the response
        #                might contain private user data
        #   * no-cache => cache entries must always be revalidated
        #   * must-revalidate => necessary to force caches which are configured to serve stale content
        #                        to revalidate their content
        #   * max-age=0 => Expires the cache entry immediately; clients must revalidate before serving
        #                  content from the cache
        #   * post-check, pre-check => IE-specific extensions: http://blogs.msdn.com/b/ieinternals/archive/2009/07/20/
        #                              using-post_2d00_check-and-pre_2d00_check-cache-directives.aspx
        h = response.headers
        h['Cache-Control'] = 'private, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0'
        h['Expires'] = 'Thu, 01 Dec 1994 16:00:00 GMT'  # definitely in the past => no caching
        response.set_etag(str(hexdigest))
        return response

    def handle(self, method, *args, **kwargs):

        _do_profile = 1
        start = time.time()
        if method.lower() == 'options':
            response = make_response('')
            status_code = 200
        elif not hasattr(self, method.lower()):
            response = self.make_response({'message': 'Method forbidden'})
            status_code = 403
        else:
            handler = getattr(self, method.lower())
            try:
                logger.debug("{} {} {}".format(handler, method, args))
                handler_response = handler(*args, **kwargs)
                # we commit all open transactions, just in case...
                while backend._transactions:
                    backend.commit()
                if isinstance(handler_response, (tuple, list)):
                    data, status_code = handler_response
                    response = self.make_response(data)
                else:
                    response = handler_response
                    status_code = response.status_code
            except TypeError as e:
                response = self.make_response({'message': 'An unknown error occured'})
                logger.error(traceback.format_exc())
                status_code = 403
            except BaseException as e:
                response = self.make_response({'message': 'Internal server error'})
                logger.error(unicode(e))
                logger.error(traceback.format_exc())
                status_code = 500
        response.headers.add('X-elapsed-time-ms', str("%d" % int((time.time() - start) * 1000)))
        if self.crossdomain:
            response.headers['Access-Control-Allow-Origin'] = self.crossdomain['origin']
            response.headers['Access-Control-Allow-Methods'] = self.crossdomain['methods']
            response.headers['Access-Control-Max-Age'] = str(self.crossdomain['max-age'])
        return self.add_cache_headers(response), status_code
