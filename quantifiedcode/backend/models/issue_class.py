# -*- coding: utf-8 -*-

"""
    Implements Issue Class
"""




from blitzdb.fields import ManyToManyField
from checkmate.lib.models import IssueClass as BaseIssueClass

class IssueClass(BaseIssueClass):

    tags = ManyToManyField("Tag")
