/*
 * This file is part of Betterscan CE (Community Edition).
 *
 * Betterscan is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Betterscan is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Betterscan. If not, see <https://www.gnu.org/licenses/>.
 *
 * Originally licensed under the BSD-3-Clause license with parts changed under
 * LGPL v2.1 with Commons Clause.
 * See the original LICENSE file for details.
*/
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
