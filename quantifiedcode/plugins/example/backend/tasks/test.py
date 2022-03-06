"""

    Contains tasks and helper functions to send notifications.

"""





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
