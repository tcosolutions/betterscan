# -*- coding: utf-8 -*-

"""

    Contains form used to create or update projects.

"""




from wtforms import Form, BooleanField, TextAreaField, StringField, validators
from .validators import GitUrl,GitKey

class EditProjectForm(Form):

    url = StringField("URL", [validators.DataRequired(), GitUrl()])
    private_key = StringField("PRIVATEKEY", [validators.DataRequired(), GitKey()])



class NewProjectForm(Form):

    NAME_LENGTH_MIN = 2
    NAME_LENGTH_MAX = 50

    public = BooleanField("Public", [validators.InputRequired()])
    description = StringField("Description", [validators.Optional()])
    url = StringField("URL", [validators.DataRequired(), GitUrl()])
    private_key = StringField("PRIVATEKEY", [validators.DataRequired(), GitKey()])
    name = StringField("Name", [validators.Length(min=NAME_LENGTH_MIN, max=NAME_LENGTH_MAX)])
