# -*- coding: utf-8 -*-

"""

"""

from __future__ import unicode_literals
from __future__ import print_function

from werkzeug.routing import BaseConverter

class RegexConverter(BaseConverter):

    def __init__(self, url_map, *items):
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]
