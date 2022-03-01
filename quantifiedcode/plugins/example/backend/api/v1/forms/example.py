# -*- coding: utf-8 -*-

"""

    Contains forms used for Slack functionality.

"""





from wtforms import Form, StringField, validators


class ExampleForm(Form):
    """
        Example form.
    """

    test = StringField('Test', [validators.Optional()])
