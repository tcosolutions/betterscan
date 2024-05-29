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




from wtforms import Form, BooleanField, TextAreaField, StringField, validators
from .validators import GitUrl,GitKey

class EditProjectForm(Form):

    url = StringField("URL", [validators.DataRequired(), GitUrl()])
    private_key = StringField("PRIVATEKEY", [validators.Optional(), GitKey()])



class NewProjectForm(Form):

    NAME_LENGTH_MIN = 2
    NAME_LENGTH_MAX = 50

    public = BooleanField("Public", [validators.InputRequired()])
    description = StringField("Description", [validators.Optional()])
    url = StringField("URL", [validators.DataRequired(), GitUrl()])
    private_key = StringField("PRIVATEKEY", [validators.Optional(), GitKey()])
    name = StringField("Name", [validators.Length(min=NAME_LENGTH_MIN, max=NAME_LENGTH_MAX)])
