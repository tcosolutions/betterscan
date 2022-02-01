# -*- coding: utf-8 -*-

"""

    Contains validators used in the different forms.

"""

from __future__ import unicode_literals
from __future__ import print_function

import re
import yaml

from six import string_types
from wtforms import validators
from wtforms.validators import StopValidation, ValidationError

PASSWORD_LENGTH_MIN = 8
NAME_LENGTH_MIN = 4
NAME_LENGTH_MAX = 30

MAX_TAG_NUMBER = 10
TAG_LENGTH_MIN = 2
TAG_LENGTH_MAX = 30
TAG_REGEX = r"^[\w\d\-\.]{{{min},{max}}}$".format(min=TAG_LENGTH_MIN, max=TAG_LENGTH_MAX)

is_true_validator = validators.AnyOf([True])
password_validator = validators.Length(min=PASSWORD_LENGTH_MIN)
name_validator = validators.Regexp(
    r"^[\w\d\-]{{{min},{max}}}$".format(min=NAME_LENGTH_MIN, max=NAME_LENGTH_MAX),
    message="Name may only contain numbers, letters, and dashes and must be between "
            "{} and {} characters long.".format(NAME_LENGTH_MIN, NAME_LENGTH_MAX))
name_with_spaces_validator = validators.Regexp(
    r"^\s*[\w\d\-][\w\d\-\s]{{{min},{max}}}$".format(min=NAME_LENGTH_MIN - 1, max=NAME_LENGTH_MAX),
    message="Name may only contain numbers, letters, and dashes and must be between "
            "{} and {} characters long.".format(NAME_LENGTH_MIN, NAME_LENGTH_MAX))

class InputRegexp(validators.Regexp):
    """ Validates that the field value matches the given regexp
    Behaves like `wtforms.validators.Regexp`, but using `field.raw_data` insteado of `field.data`
    """

    def __call__(self, form, field, message=None):
        """ Validates the given field in the given form.
        :param form: form to validate
        :param field: field to validate
        :raise: ValidationError if the validation failed
        """
        if field.raw_data and isinstance(field.raw_data[0], string_types):
            raw_data = field.raw_data[0]
        else:
            raw_data = u''
        if not self.regex.match(raw_data or ''):
            if message is None:
                if self.message is None:
                    message = field.gettext('Invalid input.')
                else:
                    message = self.message

            raise ValidationError(message)

class InputLength(validators.Length):
    """ Behaves like `wtforms.validators.Length` but using `field.raw_data`.
    """

    def __call__(self, form, field):
        """ Validates the given field in the given form.
        :param form: form to validate
        :param field: field to validate
        :raise: ValidationError if the validation failed
        """
        if field.raw_data and isinstance(field.raw_data[0], string_types):
            raw_data = field.raw_data[0]
        else:
            raw_data = ''

        l = len(raw_data) if raw_data else 0
        if l < self.min or self.max != -1 and l > self.max:
            message = self.message
            if message is None:
                if self.max == -1:
                    message = field.ngettext("Field must be at least {min} character long.",
                                             "Field must be at least {min} characters long.", self.min)
                elif self.min == -1:
                    message = field.ngettext("Field cannot be longer than {max} character.",
                                             "Field cannot be longer than {max} characters.", self.max)
                else:
                    message = field.gettext("Field must be between {min} and {max} characters long.")

            raise ValidationError(message.format(min=self.min, max=self.max, length=l))

def validate_tags(field):
    """ Extract and validate tags from the given field.
    :param field: tags field
    :return: list of tags
    :raise: ValidationError if the severity value is invalid
    """
    if field.data is None:
        return

    tags = [tag.strip() for tag in field.data.split(',') if tag.strip()]

    for tag in tags:
        if not re.match(TAG_REGEX, tag, re.I):
            raise ValidationError("Tags may contain between 2 to 30 characters, numbers, dots (.), and hyphens (-) "
                                  "(or, if you speak Regex: ^[\w\d\-\.]{2,30}$).")
    return tags


def stop_validation_on_error(form, field):
    """ Stops validation of the form if the given field contains any errors
    :param form: form to stop validating
    :param field: field to check for errors
    :raise: StopValidation
    """
    if field.errors:
        raise StopValidation()
