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
        self.hooks = defaultdict(list)

    def register(self, name, hook):
        """ Registers a new hook for the given hook name.
        :param name: name of the hook
        :param hook: hook function
        """
        LOGGER.debug("Registering new hook for {}: {}".format(name, hook))
        if not hook in self.hooks[name]:
            self.hooks[name].append(hook)
        else:
            LOGGER.debug("Hook already registered, skipping...")

    def call(self, name, *args, **kwargs):
        """ Calls all hooks under the given hook name.
        :param name: name of the hooks to execute
        :param args: arguments passed to the hook function
        :param kwargs: keyword arguments passed to the hook function
        """
        for hook in self.hooks[name]:
            hook(*args, **kwargs)

    def call_async(self, name, *args, **kwargs):
        """ Calls all hooks under the given hook name.
        The hooks MUST be celery tasks.
        :param name: name of the hooks to execute
        :param args: arguments passed to the hook function
        :param kwargs: keyword arguments passed to the hook function
        """
        kwargs['delay'] = True
        self.call(name, *args, **kwargs)
