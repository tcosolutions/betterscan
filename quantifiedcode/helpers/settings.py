
from __future__ import unicode_literals
from __future__ import print_function

import yaml
import logging
import sys
import os
import importlib

from collections import defaultdict
from .hooks import Hooks
from checkmate.settings import Settings as CheckmateSettings
from sqlalchemy import create_engine

from blitzdb.backends.sql import Backend as SqlBackend

logger = logging.getLogger(__name__)

class Settings(object):

    def __init__(self,d):
        self._d = d
        self._checkmate_settings = None
        self._backend = None
        self.hooks = Hooks()
        self.providers = defaultdict(list)

    def initialize_logging(self):
        formatter = logging.Formatter('%(message)s')
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.DEBUG)
        ch.setFormatter(formatter)
        logger = logging.getLogger()
        logger.setLevel(logging.INFO)
        logger.addHandler(ch)

    def initialize(self, initialize_logging=True):

        if initialize_logging:
            self.initialize_logging()

        self.load_plugins()
        #we reinitialize the DB schema (as the plugins might have added new models)
        self._checkmate_settings = CheckmateSettings()
        self._checkmate_settings.initialize()
        self.initialize_backend()

    def initialize_backend(self):
        #DB schema should get initialized at the end, to account for all models included by plugins
        #(both by checkmate and QuantifiedCode)
        import quantifiedcode.backend.models
        self.backend.autodiscover_classes()
        self.backend.init_schema()

    @property
    def checkmate_settings(self):
        if self._checkmate_settings is None:
            raise AttributeError("Checkmate settings have not been initialized!")
        return self._checkmate_settings

    @property
    def backend(self):
        if self._backend is None:
            self._backend = SqlBackend(engine=self.get_engine,
                                       autoload_embedded=False,
                                       autodiscover_classes=True,
                                       allow_documents_in_query=True)
        return self._backend

    @backend.setter
    def backend(self, value):
        self._backend = value

    def get_engine(self):
        if self.get('environment','development') == 'test':
            test_postfix = '_test'
        else:
            test_postfix = ''
        if self.get('backend.db_url') is None:
            raise ValueError("No database URL given, please provide one via the 'backend.db_url' setting (requires a restart).")
        extra_args = {
            'pool_reset_on_return' : 'commit',
            'pool_recycle' : 120,
        }
        engine = create_engine(self.get('backend.db_url'+test_postfix),
                               echo=self.get('backend.db_echo'+test_postfix,False),
                               **extra_args)
        return engine

    def get(self, key, default=None):
        """
        Get a settings value
        """
        components = key.split(".")

        cd = self._d
        for component in components:
            if component in cd:
                cd = cd[component]
            else:
                return default
        return cd

    def set(self, key, value):
        """
        Set a settings value
        """
        components = key.split(".")
        cd = self._d
        for component in components[:-1]:
            if not component in cd:
                cd[component] = {}
            cd = cd[component]
        cd[components[-1]] = value

    def load_plugin_module(self, name):
        plugin_data = self.get('plugins.{}'.format(name))
        if plugin_data is None:
            raise ValueError("Unknown plugin: {}".format(name))

        setup_module_name = '{}.setup'.format(plugin_data['module'])
        setup_module = importlib.import_module(setup_module_name)
        return setup_module

    def load_plugin_config(self, name):
        setup_module = self.load_plugin_module(name)
        return setup_module.config

    def get_plugin_path(self ,name):
        setup_module = self.load_plugin_module(name)
        return os.path.dirname(setup_module.__file__)

    def load_plugin(self, name):
        """ Loads the plugin with the given name
        :param name: name of the plugin to load
        """

        plugin_data = self.get('plugins.{}'.format(name))
        if plugin_data is None:
            raise ValueError("Unknown plugin: {}".format(name))

        logger.info("Loading plugin: {}".format(name))
        config = self.load_plugin_config(name)

        #register models
        for model in config.get('models',[]):
            self.backend.register(model)

        #register providers
        for name, params in config.get('providers',{}).items():
            self.providers[name].append(params)

        # register hooks
        for hook_name, hook_function in config.get('hooks', []):
            self.hooks.register(hook_name, hook_function)

        for filename in config.get('yaml_settings', []):
            with open(filename) as yaml_file:
                settings_yaml = yaml.load(yaml_file.read())
                update(self._d, settings_yaml, overwrite=False)

        if config.get('settings'):
            update(self._d, config['settings'])

    def load_plugins(self):
        """ Loads all plugins specified in settings if they have not yet been loaded.
        """
        plugins = self.get('plugins') or []
        for plugin in plugins:
            self.load_plugin(plugin)

    def get_plugin_apis(self):
        """ Generator over all routes provided by all plugins
        :return: API dictionary with version, routes and module name
        """
        apis = {}
        for plugin_name in self.get('plugins',{}):
            config = self.load_plugin_config(plugin_name)
            api_config = config.get('api')
            if api_config:
                apis[plugin_name] = api_config
        return apis

    def get_export_map(self, resource):
        return resource.export_map

    def get_includes(self, resource):
        return resource.includes

    def get_plugin_exports(self, resource_name):
        """ Returns a combined export map for the given resource from all plugins.
        :param resource: resource name
        :return: combined export map for the given resource
        """
        exports = tuple()
        for plugin_name in self.get('plugins',{}):
            config = self.load_plugin_config(plugin_name)
            exports += config.get('exports', {}).get(resource_name, ())
        return list(exports)

    def get_plugin_includes(self, resource_name):
        """ Returns a list of all `includes` for the given resource from all
        plugins as a dictionary with HTTP methods
        as keys and a list of additional includes as the value.
        Example: the GitHub plugin adds a `github` parameter to the user object,
        which needs to be provided in the include
        argument of a database get call to be returned

        :param resource: resource name
        :return: dictionary of HTTP method: list of includes

        """
        includes = set()
        for plugin_name in self.get('plugins',{}):
            config = self.load_plugin_config(plugin_name)
            includes_config = config.get('includes')
            if includes_config:
                    includes |= set(includes_config.get(resource_name, ()))
        return list(includes)


def load_settings(filenames):
    settings_dict = {}
    for filename in filenames:
        #we use print because logging is usually not yet configured when this runs
        print("Loading settings from {}".format(filename))
        with open(filename, 'r') as yaml_file:
            settings_yaml = yaml.load(yaml_file.read())
            if settings_yaml is None:
                continue
            update(settings_dict, settings_yaml)
    return Settings(settings_dict)

def update(d, ud, overwrite=True):
    for key, value in ud.items():
        if key not in d:
            d[key] = value
        elif isinstance(value,dict):
            update(d[key], value, overwrite=overwrite)
        else:
            if key in d and not overwrite:
                return
            d[key] = value

