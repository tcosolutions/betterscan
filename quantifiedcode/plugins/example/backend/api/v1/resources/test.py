# -*- coding: utf-8 -*-

"""

    Contains implementation of the change-webhook resource for the Slack plugin.

"""

from __future__ import unicode_literals
from __future__ import print_function

import logging

from flask import request

from quantifiedcode.settings import backend
from quantifiedcode.backend.api.resource import Resource
from quantifiedcode.backend.decorators import valid_user

from ....models import Example
from ..forms.example import ExampleForm


logger = logging.getLogger(__name__)


class Test(Resource):
    """Test endpoint."""

    # TODO allow creation/deletion/etc?
    @valid_user
    def get(self):
        """ Edit the user's Slack webhook. """
        return {'message' : 'success'}, 200
