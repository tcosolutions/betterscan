# -*- coding: utf-8 -*-

from __future__ import absolute_import

import os
import click
import logging

from alembic.migration import MigrationContext
from alembic.config import Config
from alembic import command
from sqlalchemy.schema import MetaData
from quantifiedcode.settings import settings

from sqlalchemy.schema import DropTable
from sqlalchemy.ext.compiler import compiles

#we modify the DROP TABLE statement for Postgres to allow for cascading DELETES
#http://stackoverflow.com/questions/38678336/sqlalchemy-how-to-implement-drop-table-cascade
@compiles(DropTable, "postgresql")
def _compile_drop_table(element, compiler, **kwargs):
    return compiler.visit_drop_table(element) + " CASCADE"

@click.command("drop-schema")
def drop_schema():
    if click.confirm('Do you really want to delete the entire DB schema? This will erase all your data and cannot be undone!'):
        metadata = settings.backend.metadata
        metadata.reflect(settings.backend.engine)
        metadata.drop_all(settings.backend.engine, checkfirst=True)

@click.command("migrate-db")
@click.option("--plugin", default=None)
def migrate_db(plugin):
    _migrate_db(settings, plugin)

def _migrate_db(settings, plugin):
    logging.getLogger('alembic').setLevel(logging.CRITICAL)
    #we upgrade the core data model
    if plugin is None or plugin == 'core':
        path = settings.get('project_path')
        version_table_name = 'core_version_table'
        click.echo("Upgrading core data model")
        _run_alembic_migration(settings.backend, path, version_table_name)

    #we upgrade the plugin data models
    for plugin_name in settings.get('plugins'):
        if plugin is not None and plugin_name != plugin:
            continue
        path = settings.get_plugin_path(plugin_name)
        config = settings.load_plugin_config(plugin_name)
        version_table_name = config.get('version_table_name','{}_version_table'.format(plugin_name))
        click.echo("Upgrading data model for plugin '{}'".format(plugin_name))
        _run_alembic_migration(settings.backend, path, version_table_name)

def _run_alembic_migration(backend, path, version_table_name):
    alembic_config_path = os.path.abspath(os.path.join(path,"alembic.ini"))
    if not os.path.exists(alembic_config_path):
        click.echo("No migrations defined for this path, skipping...")
        return
    alembic_config = Config(alembic_config_path)
    #we set the script location programmatically (as in alembic.ini this is a relative path)
    script_location = os.path.abspath(os.path.join(path,"migrations"))
    alembic_config.set_main_option("script_location", script_location)
    with backend.transaction():
        connection = backend.connection
        alembic_config.attributes['connection'] = connection
        context = MigrationContext.configure(
            connection,
            opts = {'version_table' : version_table_name}
            )
        command.upgrade(alembic_config, "head")
