"""
This file is part of Betterscan CE (Community Edition).

Betterscan is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Betterscan is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Betterscan. If not, see <https://www.gnu.org/licenses/>.

Originally licensed under the BSD-3-Clause license with parts changed under
LGPL v2.1 with Commons Clause.
See the original LICENSE file for details.

"""
from quantifiedcode.backend.models import User, AccessToken
from quantifiedcode.settings import backend

import uuid

def user(test, fixtures, name, email, password, superuser=False,):

    user = User({'name' : name,'email' : email})
    user.set_password(password)
    user.unencrypted_password = password
    with backend.transaction():
        backend.save(user)

    access_token = AccessToken({'user' : user, 'token' : uuid.uuid4().hex})
    with backend.transaction():
        backend.save(access_token)
    return user

def normal_user(test, fixtures):
    return user(test, fixtures, name='test', email='test@test.de', password='testtest', superuser=False)
