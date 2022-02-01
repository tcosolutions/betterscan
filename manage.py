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
