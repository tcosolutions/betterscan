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
