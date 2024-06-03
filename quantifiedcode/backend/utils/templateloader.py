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
    Template loader for jinja templates.
"""

from os.path import join, getmtime, exists
from jinja2 import BaseLoader, TemplateNotFound

class TemplateLoader(BaseLoader):

    def __init__(self, paths):
        """
        :param paths: Should be a dictionary containing string keys (names) and string values (directories).
                      When searching for a template, the directories will be checked in the order of their key.
        """
        self.paths = paths

    def get_source(self, environment, template):
        for key, path in sorted(list(self.paths.items()), key=lambda x:x[0]):
            template_path = join(path, template)
            if not exists(template_path):
                continue
            mtime = getmtime(template_path)
            with open(template_path) as f:
                source = f.read()
            return source, template_path, lambda: mtime == getmtime(path)

        raise TemplateNotFound(template)
