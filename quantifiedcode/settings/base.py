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
    Contains settings for QuantifiedCode.
"""

import os
import logging

logger = logging.getLogger(__name__)

from quantifiedcode.helpers.settings import Settings, load_settings

project_path = os.path.abspath(__file__ + "/../../")
settings_filenames = []

#usually we always include the default settings (which can be overwritten)
if not os.environ.get('QC_SKIP_DEFAULTS'):
    settings_filenames.append(os.path.join(project_path,'settings/default.yml'))

_qc_settings =  os.environ.get('QC_SETTINGS')
 
#if a settings file is given via environment variable, we load settings from there
if _qc_settings:
    qc_settings_filename = os.path.abspath(_qc_settings)
    settings_filenames.append(qc_settings_filename)
    settings_source = qc_settings_filename
#if no settings variable is given, we look for settings in the current directory
else:
    local_settings_filename = os.path.join(os.getcwd(),'settings.yml')
    settings_source = local_settings_filename
    if not os.path.exists(local_settings_filename) or not os.path.isfile(local_settings_filename):
        logger.error("I cannot find a settings file, please specify one via the QC_SETTINGS environment variable.")
    settings_filenames.append(local_settings_filename)

#if QC_SECRETS is set, we load secret settings from that file (useful if you have things that you don't want in version control)
_qc_secrets = os.environ.get('QC_SECRETS')
if _qc_secrets:
    settings_filenames.append(os.path.abspath(_qc_secrets))

settings = load_settings(settings_filenames)

#we set project-specific paths (that the settings can't know)
settings.set('backend.path', os.path.join(project_path,'backend'))
settings.set('frontend.path', os.path.join(project_path,'frontend'))
settings.set('frontend.settings.url','{}{}'.format(settings.get('url'), settings.get('frontend.url')))
settings.set('frontend.settings.backend_url','{}{}'.format(settings.get('url'), settings.get('backend.url')))
settings.set('project_path', project_path)
settings.set('environment',os.environ.get('ENVIRONMENT','development').lower())
settings.set('backend.template_paths.500_core', os.path.join(project_path,'backend/templates'))

backend = settings.backend
