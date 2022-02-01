# -*- coding: utf-8 -*-

"""
Jinja Settings
"""

import os

from jinja2 import Environment
from ..utils import TemplateLoader

from quantifiedcode.backend.templates.filters import metricsuffix
from quantifiedcode.settings import settings

#we set up the jinja environment with the template directories
project_path = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
jinja_env = Environment(loader=TemplateLoader(paths=settings.get('backend.template_paths')))

#we add a metric suffix filter
jinja_env.filters['metricsuffix'] = metricsuffix
