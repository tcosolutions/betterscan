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
    Contains implementation of the AuthToken resource.
"""




import hmac
import base64
import hashlib

from flask import request

from quantifiedcode.settings import settings
from quantifiedcode.backend.api.resource import Resource
from quantifiedcode.backend.decorators import valid_user

class AuthTokenGenerationException(Exception):
    pass


class AuthTokenInvalidException(Exception):
    pass

class AuthToken(Resource):

    @valid_user
    def get(self, service_name):
        """ Generates an auth token based on the given service name.
        :param service_name: name of the service, e.g. `github`
        :return: auth token specific for the user and the service
        """
        try:
            token = self.generate(request.user.name, service_name)
        except AuthTokenGenerationException:
            return {'message': "error, could not generate auth token"}, 400
        return {'token': token}, 200

    @staticmethod
    def get_key():
        """ Returns the backend secret key, if one is not set, raises an exception.
        :return: backend secret key
        """
        try:
            return settings.get('backend')['secret_key']
        except AttributeError:
            raise AuthTokenGenerationException()

    @classmethod
    def generate(cls, user, service):
        """ Generates an auth token for the given user and the given service
        :param user: user name
        :param service: service name
        :return: auth token for the user and the service
        """
        string = "{}:{}".format(user, service)
        key = cls.get_key()
        signature = base64.b64encode(hmac.new(key, msg=string, digestmod=hashlib.sha256).digest())
        return "{}:{}:{}".format(user, service, signature)

    @classmethod
    def validate(cls, token, user, service):
        """ validates the given token with the given user and service
        :param token: token to validate
        :param user: username
        :param service: service name
        :return: True if the token is valid for the given user and service
        """
        expected = cls.generate(user, service)
        return token == expected

    @classmethod
    def split(cls, data):
        """ Decodes the given auth token and returns a user name and a service name.
        :param data: auth token
        :return: username, servicename, key
        """
        parts = data.split(":", 2)
        if len(parts) != 3:
            raise AuthTokenInvalidException()
        user, service, signature = parts
        return user, service, signature
