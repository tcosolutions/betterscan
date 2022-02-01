# -*- coding: utf-8 -*-

"""

    Contains form used to create or update projects.

"""

from __future__ import unicode_literals
from __future__ import print_function

from wtforms import Form, BooleanField, TextAreaField, StringField, validators
from .validators import GitUrl

class EditProjectForm(Form):

    url = StringField("URL", [validators.DataRequired(), GitUrl()])

class NewProjectForm(Form):

    NAME_LENGTH_MIN = 2
    NAME_LENGTH_MAX = 50

    public = BooleanField("Public", [validators.InputRequired()])
    description = StringField("Description", [validators.Optional()])
    url = StringField("URL", [validators.DataRequired(), GitUrl()])
    name = StringField("Name", [validators.Length(min=NAME_LENGTH_MIN, max=NAME_LENGTH_MAX)])
