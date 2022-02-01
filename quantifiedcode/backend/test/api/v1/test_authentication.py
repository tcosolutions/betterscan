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
