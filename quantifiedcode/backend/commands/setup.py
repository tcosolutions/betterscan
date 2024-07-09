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

import click
import logging
import yaml
import os

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

    # we create a new Settings object without defaults & secrets (as we're gonna write it back to the file)
    with open(settings_source, 'r') as input_file:
        settings_dict = yaml.safe_load(input_file)

    click.echo("Hi! Let's get started with setting up your instance of QuantifiedCode.")
    click.echo("I will modify your setting file {source} and will put a backup in {source}.backup".format(source=settings_source))

    if settings.get('backend.db_url') is None:
        db_default_url = 'sqlite+pysqlite:///qc.sqlite'
        db_url = click.prompt("\n\nLet's first set up your database. Please provide a SQLAlchemy-compatible URL\n(see here for more info: http://docs.sqlalchemy.org/en/latest/core/engines.html)", default=db_default_url)

        # we update the database URL
        settings.set('backend.db_url', db_url)

        # we also update the settings_dict value
        if 'backend' not in settings_dict:
            settings_dict['backend'] = {}
        settings_dict['backend']['db_url'] = db_url

    if settings.get('url') is None:
        default_url = 'http://localhost:5000'
        url = click.prompt('\n\nWhich address shall we use for your QuantifiedCode instance?', default=default_url)
        settings.set('url', url)
        settings_dict['url'] = url

    click.echo("\n\nTrying to connect to the database...")
    settings.initialize_backend()
    backend = settings.backend
    try:
        engine = backend.engine
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        click.echo("Seems everything's working!")
    except Exception as e:
        click.echo("Cannot connect to the database. Please try to run setup again...")
        raise e

    click.echo("\n\nOkay, now we'll run the database migrations...\n")
    try:
        _migrate_db(settings, None)
    except Exception as e:
        click.echo("Failed running migrations, aborting...")
        raise e

    click.echo("Done running migrations.")
    click.echo("\nNow we'll import issue classes from checkmate...\n")

    _import_issue_classes()

    click.echo("\n\nFinally, let's set up plugins...\n")
    # we call possible setup hooks from the plugins
    settings.hooks.call("setup", settings, settings_dict)

    # Generate HMAC key and store it in settings_dict
    hmac_key = os.urandom(32)
    settings_dict['secret_key'] = hmac_key.hex()

    click.echo("\n\nGenerated HMAC key and added to settings.")

    # Save the updated settings_dict back to the settings file
    with open(settings_source, 'w') as output_file:
        yaml.safe_dump(settings_dict, output_file)

    click.echo("\n\nGreat, you're all set!")


