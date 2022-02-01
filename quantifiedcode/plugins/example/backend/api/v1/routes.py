# -*- coding: utf-8 -*-

"""

    Contains routes provided by the Slack plugin

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

from .resources.test import Test

prefix = "/scaffold"

routes = [
    # authorization
    {prefix + '/test': [Test, {'methods': ['GET']}]},
]
