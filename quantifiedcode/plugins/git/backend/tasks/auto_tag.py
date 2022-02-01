# -*- coding: utf-8 -*-

"""

    Contains hooks used in the analysis of Git projects.

"""

from __future__ import unicode_literals
from __future__ import print_function
from __future__ import absolute_import

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
