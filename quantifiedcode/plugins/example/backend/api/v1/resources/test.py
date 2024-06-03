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

    Contains implementation of the change-webhook resource for the Slack plugin.

"""




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
