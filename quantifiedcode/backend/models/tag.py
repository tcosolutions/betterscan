from blitzdb.fields import CharField
from checkmate.lib.models import BaseDocument

class Tag(BaseDocument):

    name = CharField(indexed=True, unique=True, length=50)
