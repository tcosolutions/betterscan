import uuid
import tempfile
import shutil
import subprocess
import os

from quantifiedcode.settings import settings, backend
from quantifiedcode.backend.models import Project, UserRole
from ..models import GitRepository

def update_remote(project):
    """ Updates all remotes of the given project in the local repository for the project.
    :param project: project to update the remotes for
    :return: project
    """

    repository = project.git.eager.repository

    remotes = {remote['name']: remote for remote in repository.get_remotes()}

    remote_name = 'origin'
    if remote_name not in remotes:
        repository.add_remote(remote_name, project.git.url)
    elif project.git.url != remotes[remote_name]['url']:
        repository.update_remote_url(remote_name, project.git.url)

    return project

def initialize_repository(project, clear_first=True):
    """ Initialize a repository for the project with the given id.
    :param project_id: id of the project
    :param clear_first: if true and the directory already exists, it will be removed first
    :raise: Project.DoesNotExist
    """
    path = project.git.eager.path
    path_exists = os.path.exists(path)

    if clear_first and path_exists:
        shutil.rmtree(path)

    if not path_exists:
        os.makedirs(path, mode=0o770)

    repository = project.git.repository
    repository.init()
    return repository

def generate_key_pair(project):
    """ Generates a new SSH key pair for the given remote in the given project.
    Effect: saves the public and private keys on the appropriate remote in the project object
    :param project: project to generate the key pair for
    """

    tempdir = tempfile.mkdtemp()

    try:
        subprocess.call(["ssh-keygen", "-t", "rsa", "-q", "-f", "testkey", "-N", "", "-C", project.pk], cwd=tempdir)

        with open(os.path.join(tempdir, "testkey"), 'r') as private_key_file:
            private_key = private_key_file.read()

        with open(os.path.join(tempdir, "testkey.pub"), 'r') as public_key_file:
            public_key = public_key_file.read()

        with backend.transaction():
            backend.update(project.git,{
                'private_key' : private_key,
                'public_key' : public_key
            })
    finally:
        shutil.rmtree(tempdir)


def create_project(project_data, git_data, user):
    """
    Creates a new project with the given data and performs the necessary initialization steps.

    :param data: data to use to create the project
    :return: object representing the newly created project
    """

    project = Project(project_data)
    project.pk = uuid.uuid4().hex

    settings.hooks.call("project.create.before", project)

    if not project.get('permalink'):
        project.permalink = project.pk

    git = GitRepository(git_data)
    git.project = project
    project.git = git
    #we make the user owner of the project
    user_role = UserRole({
        'project' : project,
        'user' : user,
        'role' : 'owner'
        })

    with backend.transaction():
        backend.save(project)
        backend.save(git)
        backend.save(user_role)

    #we run git-specific initialization tasks
    generate_key_pair(project)
    initialize_repository(project)
    update_remote(project)

    settings.hooks.call("project.create.after", project)

    return project
