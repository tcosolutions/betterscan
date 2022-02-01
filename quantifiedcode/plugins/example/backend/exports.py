# -*- coding: utf-8 -*-

"""

    Contains additional export fields provided by this plugin for core resources.

"""

from __future__ import unicode_literals
from __future__ import print_function

from .models import Example

exports = {
    'UserProfile': (
            {'example': Example.export_map},
    ),
}
