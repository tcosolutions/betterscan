import click

from quantifiedcode.backend.models import Project
from quantifiedcode.settings import settings, backend
from quantifiedcode.backend.tasks.project.analyze import _analyze_project
from quantifiedcode.backend.tasks.project.reset import _reset_project
from quantifiedcode.backend.tasks.project.delete import _delete_project

@click.group("project")
def project():
    """
    Project-related commands.
    """

def _find_project(name_or_pk):
    try:
        return backend.get(Project,{'$or' : [{'name' : name_or_pk}, {'pk' : name_or_pk}]})
    except Project.DoesNotExist:
        raise click.ClickException("Project does not exist!")

@project.command("analyze")
@click.argument("name_or_pk")
def analyze_project(name_or_pk):
    """
    Analyze a project with a given name or primary key (pk).
    """
    project = _find_project(name_or_pk)
    _analyze_project(project)

@project.command("reset")
@click.argument("name_or_pk")
def reset_project(name_or_pk):
    """
    Reset a project with a given name or primary key (pk).
    """
    project = _find_project(name_or_pk)
    _reset_project(project)

@project.command("delete")
@click.argument("name_or_pk")
def delete_project(name_or_pk):
    """
    Delete a project with a given name or primary key (pk).
    """
    project = _find_project(name_or_pk)
    _delete_project(project)
