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
from flask import Flask
from flask.helpers import send_from_directory
from werkzeug.exceptions import NotFound

class StaticFilesFlask(Flask):

    """
    Helper class to send static files from multiple directories (required for plugins)
    """

    def __init__(self, *args, **kwargs):
        super(StaticFilesFlask, self).__init__(*args, **kwargs)
        self.static_folders = []

    @property
    def all_static_folders(self):
        return [self.static_folder]+self.static_folders[:]

    def add_static_folder(self, folder):
        if not folder in self.static_folders:
            self.static_folders.append(folder)

    def send_static_file(self, filename):

        if not self.has_static_folder:
            raise RuntimeError('No static folder defined')

        cache_timeout = self.get_send_file_max_age(filename)
        folders = [self.static_folder]+self.static_folders

        for folder in folders:
            try:
                return send_from_directory(
                    folder, filename, cache_timeout=cache_timeout)
            except NotFound:
                pass

        raise NotFound()
