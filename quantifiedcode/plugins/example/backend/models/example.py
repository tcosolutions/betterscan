# -*- coding: utf-8 -*-

"""

    Contains a model that stores additional Slack data for Users.

"""

from __future__ import unicode_literals
from __future__ import print_function

from checkmate.lib.models import BaseDocument
from blitzdb.fields import ForeignKeyField, TextField


class Example(BaseDocument):
    """
        An example model that has a relationship to a given user.
    """
    export_map = (
        "test",
    )

    user = ForeignKeyField("User", backref="example", unique=True, ondelete="CASCADE")
    test = TextField()
