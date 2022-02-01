# -*- coding: utf-8 -*-

"""

    Contains information needed to set up the plugin.

"""

from .email_provider import send_email

import os

plugin_path = os.path.dirname(__file__)

config = {
    'providers' : {
        'email.send' : {
            'provider' : send_email
        },
    },
    'yaml_settings' : [os.path.join(plugin_path,'settings/default.yml')],
    'name': 'E-Mail',
    'description': "Sends e-mails"
}
