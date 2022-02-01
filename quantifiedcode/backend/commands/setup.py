# -*- coding: utf-8 -*-

from __future__ import absolute_import
import click
import logging
import yaml

from .data_model import _migrate_db
from .checkmate import _import_issue_classes

logger = logging.getLogger(__name__)

from quantifiedcode.settings import settings_source, settings

@click.command("setup")
def setup():
    """
    Sets up the QuantifiedCode installation.

    Does the following things:

    * Sets up a database connection.
    * Migrates the database.
    * Generates server-side secrets and settings.
    """

    #we create a new Settings object without defaults & secrets (as we're gonna write it back to the file)
    with open(settings_source,'r') as input_file:
        settings_dict = yaml.load(input_file)

    click.echo("Hi! Let's get started with setting up your instance of QuantifiedCode.")
    click.echo("I will modify your setting file {source} and will put a backup in {source}.backup".format(source=settings_source))

    if settings.get('backend.db_url') is None:
        db_default_url = 'sqlite+pysqlite:///qc.sqlite'
        db_url = click.prompt("\n\nLet's first set up your database. Please provide a SQLAlchemy-compatible URL\n(see here for more info: http://docs.sqlalchemy.org/en/latest/core/engines.html)", default=db_default_url)

        #we update the database URL
        settings.set('backend.db_url', db_url)

        #we also update the settings_dict value
        if not 'backend' in settings_dict:
            settings_dict['backend'] = {}
        settings_dict['backend']['db_url'] = db_url

    if settings.get('url') is None:
        default_url = 'http://localhost:5000'
        url = click.prompt('\n\nWich address shall we use for your QuantifiedCode instance?', default=default_url)
        settings.get('url', url)
        settings_dict['url'] = url
    
    click.echo("\n\nTrying to connect to the database...")
    settings.initialize_backend()
    backend = settings.backend
    try:
        engine = backend.engine
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        click.echo("Seems everything's working!")
    except:
        click.echo("Cannot connect to the database. Please try to run setup again...")
        raise
    click.echo("\n\nOkay, now we'll run the database migrations...\n")
    try:
        _migrate_db(settings, None)
    except:
        click.echo("Failed running migrations, aborting...")
        raise
    click.echo("Done running migrations.")
    click.echo("\nNow we'll import issue classes from checkmate...\n")

    _import_issue_classes()

    click.echo("\n\nFinally, let's set up plugins...\n")
    #we call possible setup hooks from the plugins
    settings.hooks.call("setup", settings, settings_dict)

    click.echo("\n\nGreat, you're all set!")