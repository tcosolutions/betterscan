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

    Contains custom form fields.

"""




import json
import logging

from wtforms import Field
from six import string_types

logger = logging.getLogger(__name__)

class StrippedStringField(Field):
    """ A String field which automatically removes surrouding spaces from strings """

    def process_formdata(self, value):
        self.data = value[0].strip() if value else ""

    def process_data(self, value):
        self.data = value.strip() if isinstance(value, string_types) else ""


class JSONField(Field):
    """ Form field which accepts JSON data. """

    def process_formdata(self, value):

        if value:
            try:
                self.data = json.loads(value[0])
            except ValueError:
                self.data = None
                raise ValueError(self.gettext('Not a valid json string.'))
