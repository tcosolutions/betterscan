# -*- coding: utf-8 -*-

"""

    Contains form used to create or update projects.

"""




from wtforms import Form, BooleanField, TextAreaField, StringField, SelectField, IntegerField, validators, ValidationError
from .validators import validate_tags

import re


class SnapshotIssuesSummaryForm(Form):

    with_files = BooleanField("With files", default=False, validators=[validators.Optional()])
    ignore = BooleanField("Show ignored issues", default=False, validators=[validators.Optional()])

class SnapshotFileRevisionIssuesForm(Form):

    limit = IntegerField("Limit", validators=[validators.NumberRange(min=1,max=1000000),validators.Optional()],default=20)
    offset = IntegerField("Offset", validators=[validators.NumberRange(min=0), validators.Optional()],default=0)
    analyzer_code = StringField("Analyzer Code", validators=[validators.Optional()],default="")
    issue_type = SelectField("Sort Field", choices=[("fixed","fixed"),("added","added"),],validators=[validators.Optional()], default="")
    exact = BooleanField("Exact match for filename", default=False, validators=[validators.Optional()])
    ignore = BooleanField("Show ignored issues", default=False, validators=[validators.Optional()])

    def validate_analyzer_code(self, field):
        regex = r"^([\w\d]{2,30}):([-\w\d]{2,100})$"
        match = re.match(regex, field.data, re.I)
        if not match:
            raise ValidationError("Analyzer-code must be in the format {}!".format(regex))
        field.data = match.groups()

class SnapshotSummaryForm(Form):

    language = StringField("Language", validators=[validators.Regexp(r"^[\w\d\-]{2,30}$")])
    analyzers = StringField("Analyzer", validators=[validators.DataRequired()])

    def validate_analyzer(self, field):
        field.data = field.data.split(',')
        for analyzer in field.data:
            if not re.match(r"^[\w\d\-_]+$", analyzer, re.I):
                raise ValidationError("Analyzer names must not contain any special characters!")
