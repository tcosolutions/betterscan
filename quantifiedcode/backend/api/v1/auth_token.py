# -*- coding: utf-8 -*-

"""
    Contains implementation of the AuthToken resource.
"""

from __future__ import unicode_literals
from __future__ import print_function

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
