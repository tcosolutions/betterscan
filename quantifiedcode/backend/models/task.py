# -*- coding: utf-8 -*-

from blitzdb.fields import ForeignKeyField, CharField, DateTimeField
from checkmate.lib.models import BaseDocument

class Task(BaseDocument):
    """
    This class is used to store backend tasks that need to be performed, e.g. analyzing a project.
    """

    class Type:
        analysis = "analysis"
        delete = "delete"
        reset = "reset"

    project = ForeignKeyField('Project')
    type = CharField(indexed=True, length=50)
    status = CharField(indexed=True, length=50)
    last_ping = DateTimeField(indexed=True)
