# -*- coding: utf-8 -*-

"""
    Implements Issue Class
"""

from __future__ import unicode_literals
from __future__ import print_function

from blitzdb.fields import ManyToManyField
from checkmate.lib.models import IssueClass as BaseIssueClass

class IssueClass(BaseIssueClass):

    tags = ManyToManyField("Tag")
