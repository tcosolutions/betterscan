# -*- coding: utf-8 -*-

"""

    Contains custom form fields.

"""

from __future__ import unicode_literals
from __future__ import print_function

import json
import logging

from wtforms import Field
from six import string_types

logger = logging.getLogger(__name__)

class StrippedStringField(Field):
    """ A String field which automatically removes surrouding spaces from strings """

    def process_formdata(self, value):
        self.data = value[0].strip() if value else ""

    def process_data(self, value):
        self.data = value.strip() if isinstance(value, string_types) else ""


class JSONField(Field):
    """ Form field which accepts JSON data. """

    def process_formdata(self, value):

        if value:
            try:
                self.data = json.loads(value[0])
            except ValueError:
                self.data = None
                raise ValueError(self.gettext(u'Not a valid json string.'))
