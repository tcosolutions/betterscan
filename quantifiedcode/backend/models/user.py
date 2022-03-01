# -*- coding: utf-8 -*-

"""

    Contains user models.

"""



from passlib.hash import pbkdf2_sha256
import uuid

from blitzdb.fields import ForeignKeyField, CharField, DateTimeField, BooleanField
from checkmate.lib.models import BaseDocument

class User(BaseDocument):

    name = CharField(indexed=True, unique=True, length=50)
    email = CharField(indexed=True, unique=True, length=255)
    new_email = CharField(indexed=True, unique=False, length=255)
    email_change_requested_at = DateTimeField()
    email_validated = BooleanField(indexed=True, default=False)
    email_validation_code = CharField(indexed=True, length=64)
    password = CharField(indexed=False, length=128)
    password_reset_code = CharField(indexed=True, length=64)
    password_reset_requested_at = DateTimeField()
    terms_accepted = BooleanField(default=False)
    terms_accepted_at = DateTimeField()
    superuser = BooleanField(default=False)
    delete = BooleanField(default=False, indexed=True)
   

    def set_password(self, password):
        self.password = pbkdf2_sha256.hash(password)
        self.password_set = True

    def check_password(self, password):
        return pbkdf2_sha256.verify(password, self.password)

    def get_access_token(self):
        access_token = AccessToken({'user': self,
                                    'token': uuid.uuid4().hex})
        return access_token

    def is_superuser(self):
        return True if 'superuser' in self and self.superuser else False


class UserRole(BaseDocument):
    user = ForeignKeyField('User', backref='user_roles')
    project = ForeignKeyField('Project', backref='user_roles')
    role = CharField(indexed=True, length=30)

class AccessToken(BaseDocument):
    token = CharField(indexed=True, length=64)
    user = ForeignKeyField('User', backref='access_tokens')
