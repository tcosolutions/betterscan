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
from quantifiedcode.settings import backend, settings
from alembic import context

config = context.config

def run_migrations_offline(plugin_name):
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        connection=backend.connection,
        version_table='{}_version_table'.format(plugin_name),
        url=url, target_metadata=backend.metadata,
        literal_binds=True)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online(plugin_name):
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """

    connectables_and_metadata = [(backend.engine, backend.metadata)]

    for connectable, metadata in connectables_and_metadata:
        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=metadata,
                version_table='{}_version_table'.format(plugin_name),
            )

            with context.begin_transaction():
                context.run_migrations()

def main(plugin_name):
    settings.initialize(backend)
    with backend.transaction():
        if context.is_offline_mode():
            run_migrations_offline(plugin_name)
        else:
            run_migrations_online(plugin_name)
