"""
This file is part of Betterscan CE (Community Edition).

Betterscan is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Betterscan is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Betterscan. If not, see <https://www.gnu.org/licenses/>.

Originally licensed under the BSD-3-Clause license with parts changed under
LGPL v2.1 with Commons Clause.
See the original LICENSE file for details.

"""
# -*- coding: utf-8 -*-

"""

    Contains functions used for creating and updating Git projects.

"""





import logging
import os
import shutil
import subprocess
import tempfile
import re
import uuid
import requirements

from checkmate.contrib.plugins.git.lib.repository import Repository
from quantifiedcode.settings import backend
from quantifiedcode.backend.models import Project

logger = logging.getLogger(__name__)

def extract_tags_from_requirements_txt(repository, branch):
    """ Extracts tags from a requirements.txt file inside the repository on the given branch.

    :param repository: repository to look in
    :param branch: specific branch inside the repository
    :return: set of tags
    """
    logger.debug("Extracting tags from requirements file on {}".format(branch))

    tags = set()
    try:
        requirements_str = repository.get_file_content(branch, "requirements.txt")
    except IOError:
        logger.info("Error: Can't get requirements file from {}".format(branch))
        return tags

    try:
        parsed_requirements = requirements.parse(requirements_str)
        parsed_requirements = parsed_requirements.decode("utf-8")
    except Exception as err:
        logger.info("Error {0}: Can't parse requirements file {1} in {2}".format(
            err.__class__.__name__, requirements_str, branch))
        return tags

    for req in parsed_requirements:
        # check if this requirement is a normal specifier, i.e. no git url etc.
        try:
            if not req.specifier:
                continue

            req_name = req.name.lower()
            tags.add(req_name)

            for version_spec in req.specs:
                truncated_version = re.match(r"^(\d+\.\d+)", version_spec[1])
                if truncated_version is None:
                    continue
                truncated_version = truncated_version.group(0)
                if version_spec[0] in ["==", "===", "~="]:
                    tags.add(req_name + "-" + truncated_version)

        except Exception as err:
            logger.info("Error {}: Can't parse requirements file {} in {}: {}, {}, {}".format(
                err.__class__.__name__, requirements_str, branch, req.name, req.specs, req.extras))
    return tags
