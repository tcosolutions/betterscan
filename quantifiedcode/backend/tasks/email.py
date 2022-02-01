#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
    Contains tasks and helper functions to send notifications.
"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

import logging
import datetime
import traceback
import re

from six import string_types

from quantifiedcode.settings import settings, backend
from quantifiedcode.backend.settings.jinja import jinja_env
from quantifiedcode.backend.worker import celery
from quantifiedcode.backend.models import User

logger = logging.getLogger(__name__)

def send_mail(*args, **kwargs):
    if settings.get('debug'):
        send_mail_async(*args, **kwargs)
    else:
        send_mail_async.delay(*args, **kwargs)

@celery.task(time_limit=120, queue="email", ignore_result=False)
def send_mail_async(email_to,
              template,
              template_context=None,
              email_from=None,
              name_from=None,
              email_reply_to=None,
              attachments=None):
    """ Sends an email based on the specified template.
    :param email_to: address or a list of email addresses
    :param template: name of the template to use for the email
    :param template_context: dict with template context, ie `template_context = {"diffs": aggregated_diffs}`
    :param email_from: sender of the email
    :param name_from: name of the sender
    :param email_reply_to: email address to set as the reply-to address
    :param attachments: list of attachments
    :return:
    """
    if isinstance(email_to, string_types):
        email_to = [email_to]

    if email_to is None or not isinstance(email_to, (list, tuple)):
        raise ValueError("email_to is None or incompatible type!")

    if template_context is None:
        template_context = {}

    email_from = email_from if email_from is not None else settings.get('email.from_email')
    name_from = name_from if name_from is not None else settings.get('email.from_name')
    email_reply_to = email_reply_to if email_reply_to is not None else email_from

    if attachments is None:
        attachments = []

    # render mail content
    template_context.update(settings.get('render_context', {}))
    template_path = "email/{0}.multipart".format(template)
    template = jinja_env.get_template(template_path)
    #we generate the module, which allows us the extract individual blocks from it
    #we capture those blocks of interest using the {% set ... %} syntax
    module = template.make_module(template_context)

    logger.info("Sending an email to: {}\ntemplate: {}\ntemplate_context: {}\nsubject: {}"
                 .format("".join(email_to), template, template_context, module.subject))

    message = {
        'from_email': email_from,
        'from_name': name_from,
        'reply_to' : email_reply_to,
        'subject': module.subject,
        'html': module.html,
        'text': module.text if module.text else None,
        'to': email_to,
        'attachments': attachments,
    }

    if not settings.providers['email.send']:
        logger.warning("No e-mail providers defined, aborting...")
        return

    for params in settings.providers['email.send']:
        params['provider'](message)
        break

def send_mail_to_user(user,
                      template,
                      template_context=None,
                      delay=False,
                      **kwargs):
    """ Sends an email message if the user has a verified email and enabled email notifications
    :param user: user to send the email message to
    :param template: template for the message to send
    :param template_context: `template_context = {"diffs": aggregated_diffs}`
    :param delay: if True the send_mail function will be run asynchronously
    :return: None
    """
    function = send_mail.delay if delay is True else send_mail

    if user.email and user.email_validated:
        return function(user.email, template, template_context=template_context, **kwargs)
