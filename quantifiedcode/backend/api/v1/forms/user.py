# -*- coding: utf-8 -*-

"""


"""

from __future__ import unicode_literals
from __future__ import print_function

from flask import request
from wtforms import Form, BooleanField, PasswordField, StringField, ValidationError, validators

from .fields import JSONField, StrippedStringField
from .validators import (is_true_validator, name_validator, password_validator,
                         stop_validation_on_error)

import re

class LoginForm(Form):
    email = StringField("Email", [validators.Email()])
    password = PasswordField("Password", [validators.DataRequired(), password_validator])
    remember_me = BooleanField("Remember me")

class UsersForm(Form):
    name = StringField("Name", [validators.Optional(), validators.Regexp(r"^[\w\d]{,60}$",re.I)])
    ignore_self = BooleanField("Ignore logged in user", validators=[validators.Optional()], default=False)

class SignupForm(Form):
    name = StringField("Name", [name_validator])
    email = StringField("Email", [validators.Email()])
    password = PasswordField("Password", [password_validator])
    terms = BooleanField("Terms & Conditions",
                         [validators.DataRequired(), is_true_validator])


class PasswordResetRequestForm(Form):
    email = StringField("Email", [validators.Email()])


class PasswordResetForm(Form):
    password = PasswordField("New Password", [password_validator])


class NotificationSubscriptionForm(Form):
    immediate = BooleanField("Immediate Notifications", default=False)
    daily = BooleanField("Daily Notifications", default=False)
    weekly = BooleanField("Weekly Notifications", default=False)

class ChangePasswordForm(Form):
    verify_password = PasswordField("Verify Password")
    password = PasswordField("New Password", [validators.DataRequired(), password_validator])
    confirm_password = PasswordField("Confirm Password", [validators.DataRequired(), validators.EqualTo("password")])

    def validate_verify_password(self, field):
        """ Validates that verifiy_password matches the user's current password
        :param field: field containing the user's "verification" password
        :raise: ValidationError
        """
        user = request.user
        if user.get('password') and (not field.data or not user.check_password(field.data)):
            raise ValidationError("Wrong password.")

class UserProfileForm(Form):
    email = StrippedStringField("Email", [validators.Optional(), validators.Email()])
    email_settings = JSONField("Email Settings", )

    def validate_email_settings(self, field):
        """ Validates the the email settings contain the allowed keys and have values of the correct type.
        Effect: modifies the field data to remove disallowed keys
        :param field: field containing the email settings
        :raise: ValidationError
        """
        data = field.data or {}

        if not data:
            return
        if not isinstance(data, dict):
            raise ValidationError("Email settings should be a dictionary.")

        allowed_keys = {
            'newsletter': bool,
            'code_updates': bool,
            'notifications': bool,
        }
        for key in data.keys():
            if key not in allowed_keys:
                del data[key]
            elif not isinstance(data[key], allowed_keys[key]):
                raise ValidationError("email_settings['{}'] has to be a {}".format(key, allowed_keys[key].__name__))

class EmailNotificationsForm(Form):
    email_notifications_enabled = BooleanField("Enable email notifications", default=True)
