import re
from wtforms import ValidationError

class GitUrl(object):
    """ Checks whether the provided URL is a valid Git URL
    """

    def __init__(self, message=None):
        if message is None:
            message = ("Invalid URL format. Currently, only the following formats are supported: "
                       "https://[...], [user]@[host]:[port]/[path], git://[...]")
        self.message = message

    def __call__(self, form, field):
        """ Validates the given field in the given form.
        :param form: form to validate
        :param field: field to validate
        :raise: ValidationError if the validation failed
        """
        url = field.data
        regexes = [
            r"(git|https|ssh?)://[^\s]+$",
            r"[^\s@]+\@[^\s]+$",
        ]
        for regex in regexes:
            if re.match(regex, url, re.I):
                return True
        else:
            raise ValidationError(self.message)
