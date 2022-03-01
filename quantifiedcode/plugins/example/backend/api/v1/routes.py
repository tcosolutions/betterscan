# -*- coding: utf-8 -*-

"""

    Contains routes provided by the Slack plugin

"""





from .resources.test import Test

prefix = "/scaffold"

routes = [
    # authorization
    {prefix + '/test': [Test, {'methods': ['GET']}]},
]
