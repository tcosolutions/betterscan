# -*- coding: utf-8 -*-

"""

    Contains functions to call hooks provided by plugins.

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

import logging

from collections import defaultdict

LOGGER = logging.getLogger(__name__)

class Hooks(object):

    def __init__(self):
        self.hooks = defaultdict(lambda: defaultdict(list))

    def register(self, source, name, hook):
        """ Registers a new hook for the given source with the given hook name.
        :param source: source of the hook, i.e. plugin name
        :param name: name of the hook
        :param hook: hook function
        """
        LOGGER.debug("Registering new hook for {}: {} {}".format(source, name, hook))
        if not hook in self.hooks[name][source]:
            self.hooks[name][source].append(hook)
        else:
            LOGGER.debug("Hook already registered, skipping...")

    def call(self, source, name, *args, **kwargs):
        """ Calls all hooks under the given hook name belonging to the given source.
        :param source: source of the hook
        :param name: name of the hooks to execute
        :param args: arguments passed to the hook function
        :param kwargs: keyword arguments passed to the hook function
        """
        for hook in self.hooks[name][source]:
            hook(*args, **kwargs)

    def call_all(self, name, *args, **kwargs):
        """ Calls all hooks under the given hook name.
        :param name: name of the hooks to execute
        :param args: arguments passed to the hook function
        :param kwargs: keyword arguments passed to the hook function
        """
        for source in self.hooks[name]:
            self.call(source, name, *args, **kwargs)

    def call_async(self, source, name, *args, **kwargs):
        """ Calls all hooks under the given hook name belonging to the given source.
        The hooks MUST be celery tasks.
        :param source: source of the hook
        :param name: name of the hooks to execute
        :param args: arguments passed to the hook function
        :param kwargs: keyword arguments passed to the hook function
        """
        kwargs['delay'] = True
        self.call(source, name, *args, **kwargs)

    def call_all_async(self, name, *args, **kwargs):
        """ Calls all hooks under the given hook name.
        :param name: name of the hooks to execute
        :param args: arguments passed to the hook function
        :param kwargs: keyword arguments passed to the hook function
        """
        for source in self.hooks[name]:
            self.call_async(source, name, *args, **kwargs)
