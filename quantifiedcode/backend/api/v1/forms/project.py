"""
This file is part of Betterscan CE (Community Edition).

Betterscan is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Betterscan is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Betterscan. If not, see <https://www.gnu.org/licenses/>.

Originally licensed under the BSD-3-Clause license with parts changed under
LGPL v2.1 with Commons Clause.
See the original LICENSE file for details.

"""
# -*- coding: utf-8 -*-

"""

    Contains form used to create or update projects.

"""




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

    with_stats = BooleanField("With statistics", default=False, validators=[validators.Optional()])

class PublicProjectsForm(Form):

    sort = SelectField("Sort Field", choices=[("analyzed_at","analysis date"),("name","name"),],validators=[validators.Optional()], default="analyzed_at")
    direction = SelectField("Sort Direction", choices=[("desc","descending"),("asc","ascending"),],validators=[validators.Optional()], default="desc")
    limit = IntegerField("Limit", validators=[validators.NumberRange(min=1,max=100),validators.Optional()],default=20)
    offset = IntegerField("Offset", validators=[validators.NumberRange(min=0), validators.Optional()],default=0)
    show_failed = BooleanField("Show failed projects", validators=[validators.Optional()],default=False)
    query = StringField("Search Query", validators=[validators.Optional()],default="")

    def validate_query(self, field):
        field.data = [re.sub(r'(?:^"|"$)', '', word).strip() for word in field.data.split()]

class ProjectsForm(Form):

    sort = SelectField("Sort Field", choices=[("analyzed_at","analysis date"),("name","name"),],validators=[validators.Optional()], default="analyzed_at")
    direction = SelectField("Sort Direction", choices=[("desc","descending"),("asc","ascending"),],validators=[validators.Optional()], default="desc")
    limit = IntegerField("Limit", validators=[validators.NumberRange(min=1,max=100),validators.Optional()],default=20)
    offset = IntegerField("Offset", validators=[validators.NumberRange(min=0), validators.Optional()],default=0)
    show_failed = BooleanField("Show failed projects", validators=[validators.Optional()],default=False)
    query = StringField("Search Query", validators=[validators.Optional()],default="")

    def validate_query(self, field):
        field.data = [re.sub(r'(?:^"|"$)', '', word).strip() for word in field.data.split()]

class ProjectTagsForm(Form):

    name = StringField("Name", validators=[validators.Regexp(r"^[\w\d\-\_\.]{2,30}$", re.I)])
