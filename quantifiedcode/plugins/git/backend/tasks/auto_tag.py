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

    Contains hooks used in the analysis of Git projects.

"""





import logging

from quantifiedcode.settings import backend

from quantifiedcode.backend.models import Tag

from .project import extract_tags_from_requirements_txt

logger = logging.getLogger(__name__)

def auto_tag(project):
    """ First step of the analysis for Git projects. Determines if automatic tags have already been added and, if not
    adds them from the requirements.txt file, if one exists in the repository.
    :param project: project to auto tag
    :return:
    """
    logger.debug("Adding automatic tags to {}".format(project.pk))
    repository = project.git.eager.repository

    # auto tag the project (but only once)
    if project.get('automatic_tags_added'):
        return

    default_branch = project.git.get_default_branch()
    if default_branch is None:
        return
    tags = extract_tags_from_requirements_txt(repository, default_branch)

    with backend.transaction():
        for tag_name in tags:
            try:
                tag = backend.get(Tag, {'name': tag_name})
            except Tag.DoesNotExist:
                tag = Tag({'name': tag_name})
                backend.save(tag)

            project.tags.append(tag)

    project.automatic_tags_added = True
    with backend.transaction():
        backend.update(project, ['automatic_tags_added'])
