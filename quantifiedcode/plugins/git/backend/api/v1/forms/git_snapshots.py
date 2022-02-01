# -*- coding: utf-8 -*-

"""

    Contains form used to create or update projects.

"""

from wtforms import Form, BooleanField, IntegerField, validators

class GitSnapshotsForm(Form):

    annotate = BooleanField(u"Annotate", validators=[validators.Optional()], default=False)
    limit = IntegerField(u"Limit", validators=[validators.NumberRange(min=1,max=100),validators.Optional()],default=20)
    offset = IntegerField(u"Offset", validators=[validators.NumberRange(min=0), validators.Optional()],default=0)

