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
from quantifiedcode.settings import settings
from quantifiedcode.backend.commands import commands

import click
import os
import logging

@click.group()
def qc():
    pass

for command in commands:
    qc.add_command(command)

if __name__ == '__main__':
    settings.initialize(initialize_logging=True)
    for plugin in settings.get('plugins',[]):
        config = settings.load_plugin_config(plugin)
        if 'commands' in config:
            for command in config['commands']:
                qc.add_command(command)
    qc()
