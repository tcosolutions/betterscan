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


"""




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
        for key in list(data.keys()):
            if key not in allowed_keys:
                del data[key]
            elif not isinstance(data[key], allowed_keys[key]):
                raise ValidationError("email_settings['{}'] has to be a {}".format(key, allowed_keys[key].__name__))

class EmailNotificationsForm(Form):
    email_notifications_enabled = BooleanField("Enable email notifications", default=True)
