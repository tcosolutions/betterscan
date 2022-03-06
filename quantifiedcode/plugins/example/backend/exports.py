# -*- coding: utf-8 -*-

"""

    Contains additional export fields provided by this plugin for core resources.

"""




from .models import Example

exports = {
    'UserProfile': (
            {'example': Example.export_map},
    ),
}
