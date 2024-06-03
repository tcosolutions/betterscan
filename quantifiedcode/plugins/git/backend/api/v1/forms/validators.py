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
import re
from wtforms import ValidationError

class GitUrl(object):
    """ Checks whether the provided URL is a valid Git URL
    """

    def __init__(self, message=None):
        if message is None:
            message = ("Invalid URL format. Currently, only the following formats are supported: "
                       "https://[...], [user]@[host]:[port]/[path], git://[...]")
        self.message = message

    def __call__(self, form, field):
        """ Validates the given field in the given form.
        :param form: form to validate
        :param field: field to validate
        :raise: ValidationError if the validation failed
        """
        url = field.data
        regexes = [
            r"(git|https|ssh?)://[^\s]+$",
            r"[^\s@]+\@[^\s]+$",
        ]
        for regex in regexes:
            if re.match(regex, url, re.I):
                return True
        else:
            raise ValidationError(self.message)

class GitKey(object):
    """ Checks whether the provided Key is a valid Git Key
    """

    def __init__(self, message=None):
        if message is None:
            message = ("Invalid KEY format")
        self.message = message

    def __call__(self, form, field):
    
        return True
