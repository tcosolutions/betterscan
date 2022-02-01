# -*- coding: utf-8 -*-

"""

    Contains forms used for Slack functionality.

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

from wtforms import Form, StringField, validators


class ExampleForm(Form):
    """
        Example form.
    """

    test = StringField('Test', [validators.Optional()])
