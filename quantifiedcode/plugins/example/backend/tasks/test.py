"""

    Contains tasks and helper functions to send notifications.

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

import logging
import requests
import json

from quantifiedcode.settings import settings
from quantifiedcode.backend.worker import celery

logger = logging.getLogger(__name__)

@celery.task(time_limit=120, queue="email", ignore_result=False)
def test(webhook, template, template_context=None):
    """
        Example task.
    """
    pass
