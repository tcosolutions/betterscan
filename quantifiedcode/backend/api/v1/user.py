# -*- coding: utf-8 -*-

"""
    Contains implementation user resources.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

import uuid
import time
import datetime

from flask import request

from quantifiedcode.settings import backend, settings

from ...decorators import valid_user, valid_project
from ...tasks.email import send_mail
from ...models import AccessToken, User

from ..resource import Resource

from .forms.user import (UserProfileForm, ChangePasswordForm, LoginForm, PasswordResetRequestForm,
                         PasswordResetForm, SignupForm, EmailNotificationsForm, UsersForm)

import logging
import pdb

logger = logging.getLogger(__name__)


class Users(Resource):
    """
    Returns a list of users with given criteria (useful for adding users to teams)
    """

    export_map = (
        'pk',
        'name'
    )

    @valid_user
    def get(self):
        query = {}

        form = UsersForm(request.args)

        if not form.validate():
            return {'message' : 'Please correct the errors mentioned below.', 'errors' : form.errors}, 400

        data = form.data

        if data['name']:
            query = {'name': {'$ilike': "%%{}%%".format(data['name'])}}

        if data['ignore_self']:
            if request.user:
                query = {'$and': [
                    query,
                    {'$not': {'name': request.user.name}},
                ]}

        users = backend.filter(User, query)

        if len(users) > 10:
            return {'message': 'Too many results!'}, 403

        return {'users': [self.export(user.attributes) for user in users]}, 200


class UserException(Resource):
    def get(self):
        raise BaseException("This is just a test exception! Booom :D")

class UserProfile(Resource):

    export_map = [
        'pk',
        'email',
        'email_validated',
        'email_settings',
        'name',
        'password',
        'new_email',
        'superuser',
        'moderator',
        lambda user: {'has_password': True} if user.get('password') else {'has_password': False},
        'delete'
    ]

    includes = []

    @valid_user(include=includes)
    def get(self):
        #user = self.export(request.user)
        user = backend.get(User, {'pk': request.user.pk},
                                       include=UserProfile.includes)

        #pdb.set_trace() 
        user = UserProfile.export(user)

        return {'user': user}, 200

    @valid_user(include=[])
    def put(self):

        form = UserProfileForm(request.form)

        if not form.validate():
            return {u'errors': form.errors}, 403

        user = request.user
        data = form.data
        email = data.get(u'email')
        if email:
            if (user.get('email_change_requested_at') and
                    datetime.datetime.utcnow() - user.email_change_requested_at < datetime.timedelta(minutes=30)):
                return {'message': "Please wait at least 30 minutes before requesting another e-mail change."}, 403
            with backend.transaction():
                backend.update(user, {'new_email': email,
                                      'email_validation_code': uuid.uuid4().hex,
                                      'email_change_requested_at': datetime.datetime.utcnow()})
            activation_url = "{}{}/user/validate/{}".format(
                settings.get('url'),
                settings.get('frontend.url'),
                request.user.email_validation_code
            )

            # activate email
            send_mail(
                email_to=user.new_email,
                template="verify_email",
                template_context={
                    "user_name": user.name,
                    "activation_url": activation_url
                }
            )

        email_settings = data.get(u'email_settings')

        with backend.transaction():
            if email_settings:
                email_settings = user.get('email_settings', {})
                email_settings.update(data[u'email_settings'])
                user.email_settings = email_settings
                backend.update(user, ['email_settings'])

        return {'user': self.export(user)}, 200

    @valid_user(include=[])
    def delete(self):
        """
        Marks a user for deletion (will be done in a backend task)
        """
        logger.warning("Ouch, we lost user {0}".format(request.user.name))
        with backend.transaction():
            backend.update(request.user, {'delete': True})
        return ({'message': 'We\'re sad to see you leave! Your account will be fully deleted within a few minutes.',
                 'user_id': request.user.pk},
                200)

class ChangeUserPassword(Resource):

    export_map = UserProfile.export_map

    @valid_user
    def put(self):
        form = ChangePasswordForm(request.form)
        if not form.validate():
            return ({u'errors': form.errors},
                    400)

        password = form.password.data
        request.user.set_password(password)
        if request.user.email_validated:
            send_mail(
                email_to=request.user.email,
                template="change_password",
                template_context={
                    "user_name": request.user.name
                }
            )

        with backend.transaction():
            backend.update(request.user, ['password', 'password_set'])

        return ({u'user': self.export(request.user)},
                200)

class UserLogout(Resource):

    @valid_user(anon_ok=True)
    def post(self):
        if request.access_token is None:
            return {'message': 'already logged out'}, 200
        with backend.transaction():
            backend.delete(request.access_token)
        response = self.make_response({'message': 'success'})
        response.set_cookie('access_token', value='', expires=0)
        return response

class Settings(Resource):

    def get(self):
        return {'settings' : settings.get('frontend.settings',{})}, 200

class UserLogin(Resource):

    def post(self):
        form = LoginForm(request.form)
        if form.validate():
            with backend.transaction():
                try:
                    # TODO manually specifying includes is not ideal
                    #pdb.set_trace() 
                    user = backend.get(User, {'email': form.email.data.lower()},
                                       include=UserProfile.includes)
                    
                    #pdb.set_trace()
                    #user = backend.get(User, {'email': form.email.data.lower()})
                    if user.delete is True:
                        return {'message': "Your account is scheduled for deletion. "
                                           "You can sign-up again in a few minutes."}, 403
                    if not user.check_password(form.password.data):
                        return ({'message': 'Invalid password'},
                                403)

                    access_token = user.get_access_token()

                    backend.save(access_token)

                    user_profile = UserProfile.export(user)
                    response = self.make_response({
                        'access_token': access_token.token,
                        'message': 'Success!',
                        'user': user_profile,
                    })

                    expires = (datetime.datetime.now() + datetime.timedelta(days=7)) if form.remember_me.data else None
                    response.set_cookie('access_token', value=access_token.token, expires=expires)

                    return response

                except User.DoesNotExist:
                    return {'message': 'Unknown user'}, 404
        return {'message': 'Invalid data', 'errors': form.errors}, 403

class UserSignup(Resource):
    def post(self):
        form = SignupForm(request.form)
        if form.validate():
            with backend.transaction():
                email_matches = backend.filter(User, {'email': form.email.data})
                if len(email_matches) > 0:
                    for user in email_matches:
                        if user.delete is True:
                            return ({'message': 'Your account is scheduled for deletion. Try again in a few minutes".'},
                                    403)
                    return {'message': "A user with this e-mail address already exists. "
                                       "Please try resetting your password.",
                            'resetPasswordLink': True}, 403

                try:
                    user = backend.get(User, {'name': form.name.data.lower()})
                    return {'errors': {'name': {'message': 'This login has already been chosen by another user'}},
                            'message': 'Login already in use.'}, 403
                except User.DoesNotExist:
                    pass
                except User.MultipleDocumentsReturned:
                    return {'errors': {'name': {'message': 'This login has already been chosen by another user'}},
                            'message': 'Login already in use.'}, 403
                user = User({
                    'email': form.email.data.lower(),
                    'name': form.name.data.lower(),
                    'email_validated': False,
                    'email_validation_code': uuid.uuid4().hex,
                    'terms_accepted': form.terms.data,
                    'terms_accepted_at': datetime.datetime.utcnow(),
                    'terms_accepted_from_ip': request.remote_addr,
                    'email_settings': {
                        'newsletter': True,
                        'notifications': True,
                    },
                })
                user.set_password(form.password.data)
                backend.save(user)
                access_token = AccessToken({'user': user,
                                            'token': uuid.uuid4().hex})
                backend.save(access_token)

                user_profile = UserProfile.export(user)

                response = self.make_response({
                    'access_token': access_token.token,
                    'message': 'Success!',
                    'user': user_profile,
                })

                response.set_cookie(
                    'access_token',
                    value=access_token.token,
                    expires=(datetime.datetime.utcnow() + datetime.timedelta(days=7)),
                )

                activation_url = u"{}{}/user/validate/{}".format(
                    settings.get('url'),
                    settings.get('frontend.url'),
                    user.email_validation_code,
                )

                # Activate email
                send_mail(
                    email_to=user.email,
                    template="verify_email",
                    template_context={
                        "user_name": user.name,
                        "activation_url": activation_url,
                    })

                logger.warning("Hooray, a new user has just signed up: %s" % user.name)

                return response
        return {'message': 'Invalid data', 'errors': form.errors}, 403

class EmailValidation(Resource):
    def get(self, email_validation_code):
        with backend.transaction():
            try:
                user = backend.get(
                    User,
                    {'email_validation_code': email_validation_code}
                )
                if not user.get('new_email'):
                    if not user.get('email'):
                        return {'message': 'no valid e-mail set'}, 403
                    backend.update(user, {'email_validated': True}, unset_fields=['email_validation_code'])

                    settings.hooks.call("user.email.validated", user)

                    logger.warning("Hooray, user {0} has verified his email address".format(user.name))

                else:
                    if backend.filter(User, {'email': user.new_email}):
                        return {'message': 'A user with this e-mail already exists'}, 403
                    old_email = user.email
                    new_email = user.new_email
                    backend.update(user, {'email_validated': True, 'email': user.new_email},
                                   unset_fields=['new_email', 'email_validation_code'])

                    settings.hooks.call("user.email.updated", user)

            except User.DoesNotExist:
                return {'message': 'Unknown validation code'}, 404
        return {'message': 'success'}, 200


class PasswordResetRequest(Resource):
    def post(self):
        form = PasswordResetRequestForm(request.form)
        if form.validate():
            with backend.transaction():
                try:
                    user = backend.get(User, {'email': form.email.data})
                    if 'email_validated' in user and user.email_validated:
                        backend.update(
                            user,
                            {'password_reset_code': uuid.uuid4().hex}
                        )

                        reset_url = "{}{}/user/password-reset?reset_code={}".format(
                            settings.get('url'),
                            settings.get('frontend.url'),
                            user.password_reset_code
                        )

                        # Reset Email
                        send_mail(
                            email_to=form.email.data,
                            template="reset_password",
                            template_context={
                                "user_name": user.name,
                                "reset_url": reset_url
                            }
                        )
                        return {'message': 'Email with reset link was sent.'}, 200
                    return {'message': "Your email is not validated, so we cannot send you "
                                       "a password-reset token."}, 403
                except User.DoesNotExist:
                    return {'message': 'Unknown user'}, 404
        return {'message': 'Invalid data', 'errors': form.errors}, 403


class PasswordReset(Resource):
    def post(self, password_reset_code):
        form = PasswordResetForm(request.form)
        if form.validate():
            with backend.transaction():
                try:
                    user = backend.get(
                        User,
                        {'password_reset_code': password_reset_code}
                    )
                except User.DoesNotExist:
                    return {'message': 'Unknown user'}, 404

                user.set_password(form.password.data)
                backend.update(user, ['password', 'password_set'], unset_fields=['password_reset_code'])
                access_token = user.get_access_token()
                backend.save(access_token)

                send_mail(
                    email_to=user.email,
                    template="password_reset_successful",
                    template_context={
                        "user_name": user.name
                    }
                )

                return {'message': 'success'}, 200

        return ({'message': 'Invalid data',
                 'errors': form.errors},
                403)


class EmailSettings(Resource):
    """ Used to get or set email settings for a user. """

    @valid_user
    def get(self):
        """ Returns email settings for the user.
        :return: email settings for the user
        """
        email_settings = request.user.get('email_settings', {})
        return {'email_settings': email_settings}, 200

    @valid_user
    def put(self):
        """ Enable or disable email notifications
        :return: message with status, status code
        """
        user = request.user
        form = EmailNotificationsForm(request.form)
        if form.validate():
            with backend.transaction():
                email_settings = user.get('email_settings', {})
                email_settings.update({'notifications': form.email_notifications_enabled.data})
                user.email_settings = email_settings
                backend.update(user, ["email_settings"])
            return {'message': "success"}, 200
        return {'message': "error", 'errors': form.errors}, 400
