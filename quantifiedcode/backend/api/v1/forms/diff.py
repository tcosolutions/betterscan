# -*- coding: utf-8 -*-

"""

    Contains form used to create or update projects.

"""

from __future__ import unicode_literals
from __future__ import print_function

from wtforms import Form, BooleanField, TextAreaField, StringField, SelectField, IntegerField, validators, ValidationError
from .validators import validate_tags

import re


class DiffIssuesSummaryForm(Form):

    with_files = BooleanField(u"With files", default=False, validators=[validators.Optional()])

class DiffFileRevisionIssuesForm(Form):

    limit = IntegerField(u"Limit", validators=[validators.NumberRange(min=1,max=100),validators.Optional()],default=20)
    offset = IntegerField(u"Offset", validators=[validators.NumberRange(min=0), validators.Optional()],default=0)
    analyzer_code = StringField(u"Analyzer Code", name="analyzer-code", validators=[validators.Optional()],default="")
    issue_type = SelectField(u"Sort Field", choices=[("fixed","fixed"),("added","added"),],validators=[validators.Optional()], default="")
    exact = BooleanField(u"Exact match for filename", default=False, validators=[validators.Optional()])
    ignore = BooleanField(u"Show ignored issues", default=False, validators=[validators.Optional()])

    def validate_analyzer_code(self, field):
        regex = r"^([\w\d]{2,30}):([\w\d]{2,30})$"
        match = re.match(regex, field.data, re.I)
        if not match:
            raise ValidationError("Analyzer-code must be in the format {}!".format(regex))
        field.data = match.groups()
