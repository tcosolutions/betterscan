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
    return user(test, fixtures, name=u'test', email='test@test.de', password=u'testtest', superuser=False)
