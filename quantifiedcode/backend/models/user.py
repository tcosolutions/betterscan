/*
 * This file is part of Betterscan CE (Community Edition).
 *
 * Betterscan is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Betterscan is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Betterscan. If not, see <https://www.gnu.org/licenses/>.
 *
 * Originally licensed under the BSD-3-Clause license with parts changed under
 * LGPL v2.1 with Commons Clause.
 * See the original LICENSE file for details.
*/
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
