# -*- coding: utf-8 -*-

"""

    Contains form used to create or update projects.

"""

from __future__ import unicode_literals
from __future__ import print_function

from wtforms import Form, BooleanField, TextAreaField, StringField, SelectField, IntegerField, validators
from .validators import validate_tags

import re

class ProjectForm(Form):

    public = BooleanField("Public", [validators.InputRequired()])
    description = StringField("Description", [validators.Optional()])
    tags = StringField("Tags", [validators.Optional()])

    @staticmethod
    def validate_tags(field):
        """ Validate the tags on this issue class.
        Effect: modifies the given tags field to transform the string into a list of tags
        :param field: tags field
        :raise: ValidationError if the severity value is invalid
        """
        field.data = validate_tags(field)

class ProjectDetailsForm(Form):

    with_stats = BooleanField(u"With statistics", default=False, validators=[validators.Optional()])

class PublicProjectsForm(Form):

    sort = SelectField(u"Sort Field", choices=[("analyzed_at","analysis date"),("name","name"),],validators=[validators.Optional()], default="analyzed_at")
    direction = SelectField(u"Sort Direction", choices=[("desc","descending"),("asc","ascending"),],validators=[validators.Optional()], default="desc")
    limit = IntegerField(u"Limit", validators=[validators.NumberRange(min=1,max=100),validators.Optional()],default=20)
    offset = IntegerField(u"Offset", validators=[validators.NumberRange(min=0), validators.Optional()],default=0)
    show_failed = BooleanField(u"Show failed projects", validators=[validators.Optional()],default=False)
    query = StringField(u"Search Query", validators=[validators.Optional()],default="")

    def validate_query(self, field):
        field.data = [re.sub(r'(?:^"|"$)', '', word).strip() for word in field.data.split()]

class ProjectsForm(Form):

    sort = SelectField(u"Sort Field", choices=[("analyzed_at","analysis date"),("name","name"),],validators=[validators.Optional()], default="analyzed_at")
    direction = SelectField(u"Sort Direction", choices=[("desc","descending"),("asc","ascending"),],validators=[validators.Optional()], default="desc")
    limit = IntegerField(u"Limit", validators=[validators.NumberRange(min=1,max=100),validators.Optional()],default=20)
    offset = IntegerField(u"Offset", validators=[validators.NumberRange(min=0), validators.Optional()],default=0)
    show_failed = BooleanField(u"Show failed projects", validators=[validators.Optional()],default=False)
    query = StringField(u"Search Query", validators=[validators.Optional()],default="")

    def validate_query(self, field):
        field.data = [re.sub(r'(?:^"|"$)', '', word).strip() for word in field.data.split()]

class ProjectTagsForm(Form):

    name = StringField(u"Name", validators=[validators.Regexp(r"^[\w\d\-\_\.]{2,30}$", re.I)])
