# -*- coding: utf-8 -*-

"""

    Contains functions used for fetching of Git projects.

"""





import os
import shutil
import tempfile
import re
import datetime

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
            tf.write(project.git.private_key)
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
