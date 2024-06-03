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
from ..helpers import ApiTest
from quantifiedcode.test.fixtures import normal_user
from quantifiedcode.backend.models.user import AccessToken
import requests


class UserLogin(ApiTest):
    """
    Tests the login, logout and user profile endpoints.
    """

    fixtures = [
        {'normal_user': normal_user}
    ]

    def test_login(self):
        login_data = {
            'email': self.normal_user.email,
            'password': self.normal_user.unencrypted_password
        }
        response = requests.post(self.url('/login'), data=login_data)
        assert response.status_code == 200
        data = response.json()
        assert 'access_token' in data
        assert 'user' in data
        user = data['user']
        assert 'name' in user and user['name'] == self.normal_user.name
        assert 'email' in user and user['email'] == self.normal_user.email

        access_token = self.backend.get(AccessToken, {'user': self.normal_user,
                                                      'token': data['access_token']})

        assert access_token.token == data['access_token']

    def test_profile(self):
        response = self.authenticated_get(self.normal_user, '/user')
        assert response.status_code == 200
        data = response.json()
        assert 'user' in data

    def test_logout(self):
        response = self.authenticated_post(self.normal_user, '/logout')
        assert response.status_code == 200
        response = self.authenticated_get(self.normal_user, '/user')
        assert response.status_code == 401
