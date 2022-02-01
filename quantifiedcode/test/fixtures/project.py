from quantifiedcode.backend.models import Project
from quantifiedcode.settings import backend

import uuid

def project(test, fixtures, name):

    project = Project({'name' : name,'permalink' : 'test:{}'.format(name), 'source' : 'test'})
    with backend.transaction():
        backend.save(project)
    return project


def simple_project(test, fixtures):
    return project(test, fixtures, name=u'test')
