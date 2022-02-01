from __future__ import print_function
from __future__ import with_statement
from alembic import context
from logging.config import fileConfig

plugin_name = 'scaffold'

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
from quantifiedcode.plugins.scaffold.backend.models import *
from quantifiedcode.settings import backend

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def process_revision_directives(context, revision, directives):
    # this is just for debugging purposes...
    # enable to show circular dependencies (which cause problems)
    return

    script = directives[0]

    target_metadata = context.opts['target_metadata']

    print(target_metadata.tables)

    from collections import defaultdict

    dependencies = defaultdict(set)

    for t in target_metadata.sorted_tables:
        for fkey in t.foreign_key_constraints:
            dependencies[t.name].add(fkey.referred_table.name)

    def find_circular_dependencies(dependencies):

        def walk_graph(name, path=None, tabs=0):
            if path is None:
                path = []
            for dependency in dependencies[name]:
                print("  " * tabs, dependency)
                if dependency in path:
                    print("Circular dependency:", ".".join(path + [dependency]))
                    continue
                walk_graph(dependency, path + [dependency], tabs=tabs + 1)

        for name in dependencies.keys():
            walk_graph(name)

    find_circular_dependencies(dependencies)


def run_migrations_offline():
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
        process_revision_directives=process_revision_directives,
        literal_binds=True)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
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
                process_revision_directives=process_revision_directives
            )

            with context.begin_transaction():
                context.run_migrations()


with backend.transaction():
    if backend.connection.engine.name != 'postgresql':
        # make sure to run this script only against a Postgres database
        # (since it can produce incompatible migrations otherwise)
        raise AttributeError("You are trying to run Alembic with a backend different from POSTGRES!")

    if context.is_offline_mode():
        run_migrations_offline()
    else:
        run_migrations_online()
