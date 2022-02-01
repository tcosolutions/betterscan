# -*- coding: utf-8 -*-

from wtforms import Form, BooleanField, StringField, SelectField, validators, ValidationError
from quantifiedcode.backend.models import Issue

class IssueStatusForm(Form):

    ignore = BooleanField(u"Ignore", [])
    ignore_reason = SelectField(u"Ignore Reason", choices=[(str(Issue.IgnoreReason.false_positive),"false positive"),
                                                           (str(Issue.IgnoreReason.not_relevant),"not relevant"),
                                                           (str(Issue.IgnoreReason.not_specified),"not specified")])
    ignore_comment = StringField(u"Ignore Comment",[validators.Optional()], default='')

    def validate_ignore_reason(self, field):
        try:
            field.data = int(field.data)
        except ValueError:
            raise ValidationError("Not a valid integer!")