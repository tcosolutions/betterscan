# -*- coding: utf-8 -*-

"""

    Contains form used to create or update projects.

"""




from wtforms import Form, BooleanField, TextAreaField, StringField, SelectField, IntegerField, validators, ValidationError
from .validators import validate_tags

import re


class DiffIssuesSummaryForm(Form):

    with_files = BooleanField("With files", default=False, validators=[validators.Optional()])

class DiffFileRevisionIssuesForm(Form):

    limit = IntegerField("Limit", validators=[validators.NumberRange(min=1,max=100),validators.Optional()],default=20)
    offset = IntegerField("Offset", validators=[validators.NumberRange(min=0), validators.Optional()],default=0)
    analyzer_code = StringField("Analyzer Code", name="analyzer-code", validators=[validators.Optional()],default="")
    issue_type = SelectField("Sort Field", choices=[("fixed","fixed"),("added","added"),],validators=[validators.Optional()], default="")
    exact = BooleanField("Exact match for filename", default=False, validators=[validators.Optional()])
    ignore = BooleanField("Show ignored issues", default=False, validators=[validators.Optional()])

    def validate_analyzer_code(self, field):
        regex = r"^([\w\d]{2,30}):([\w\d]{2,30})$"
        match = re.match(regex, field.data, re.I)
        if not match:
            raise ValidationError("Analyzer-code must be in the format {}!".format(regex))
        field.data = match.groups()
