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

    Contains functions used for fetching of Git projects.

"""





import os
import shutil
import tempfile
import re
import datetime
from os import environ

from checkmate.contrib.plugins.git.lib.repository import Repository

from quantifiedcode.settings import backend
from quantifiedcode.backend.models import Project



from textwrap import dedent

def fetch_remote(project,
                 branch=None,
                 git_config=None,
                 git_credentials=None,
                 report_error=True):
    """ Fetches the remote for the given project
    :param project:
    :param git_config:
    :param branch:
    :param git_credentials:
    :param report_error:
    :return:
    """


    repository = project.git.eager.repository

    remote_name = "origin"

    try:
      access_token = project.github.owner.eager.github.access_data['access_token']
      git_credentials = "https://{access_token}:x-oauth-basic@{url}".format(
            access_token=access_token,
            url=project.git.url[8:]
        )
      git_config = dedent(
            """
            [credential]
            helper = store
            """)

    except:
      pass

    # do not fetch the directory directly but instead use a copy.
    # This mitigates the risk of being unable to serve a simultaneous request
    # which relies on the git repository, f.e. to get a list of branches.
    tmp_repo_path = repository.path + "_temp"
    if os.path.exists(tmp_repo_path):
        # we should have an exclusive task log on the project, so deleting the temporary copy is ok.
        shutil.rmtree(tmp_repo_path)
    try:
        shutil.copytree(repository.path, tmp_repo_path)
        tmp_repository = Repository(tmp_repo_path)


        tmp_repository.update_remote_url(remote_name, project.git.url)


        # actually fetch the repository
        with tempfile.NamedTemporaryFile(delete=False) as tf:
            tf.write(project.git.private_key.encode())
            tf.close()

            rc = tmp_repository.fetch(remote_name, branch=branch, ssh_identity_file=tf.name,
                                      git_config=git_config, git_credentials=git_credentials)

        # move the repository back if the fetch was successful
        if rc == 0:
            shutil.rmtree(repository.path)
            shutil.move(tmp_repo_path, repository.path)
    finally:
        if os.path.isdir(tmp_repo_path):
            shutil.rmtree(tmp_repo_path)

    with backend.transaction():
        backend.update(project,{'fetch_status' : 'failed' if rc != 0 else 'succeeded',
                                'fetched_at' : datetime.datetime.utcnow(),
                                'fetch_error' : '' if rc == 0 else repository.stderr})

    if rc != 0:
        raise IOError("Cannot fetch git repository!")
