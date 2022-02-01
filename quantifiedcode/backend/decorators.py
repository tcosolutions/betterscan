# -*- coding: utf-8 -*-

"""

    Implements decorators used to retrieve and validate users/projects/teams/organizations/etc.

"""

from __future__ import unicode_literals
from __future__ import print_function

import re

from functools import wraps
from flask import request, jsonify
from collections import Sequence

from quantifiedcode.settings import backend, settings

from .helpers.snapshot import get_snapshot
from .models import AccessToken, IssueClass, Issue, Project, User, Snapshot, Diff, FileRevision

def optional_decorator(func):
    """ Specifies a decorator function which can be called with optional arguments, i.e.

        @optional_decorator
        def my_decorator(f=None, optional=None)
            pass

        can be used as:
            @my_decorator
            @my_decorator()
            @my_decorator(optional=True)

    :param func: decorator function to wrap
    :return: decorated function
    """
    @wraps(func)
    def decorated(f=None, *args, **kwargs):
        def partial(f):
            return func(f, *args, **kwargs)
        return partial(f) if f else partial
    return decorated

def requires_request_attribute(attribute_name, status_code=401):
    """ Functions wrapped with this decorator require the presence of an attribute with the given name on the
    flask request object.
    :param attribute_name: name of the attribute to ensure the presence of on the request object
    :param status_code: status code of the response that is returned
    :return:
    """
    def decorator(func):
        @wraps(func)
        def decorated(*args, **kwargs):
            if not hasattr(request, attribute_name):
                return {'message': 'Invalid {}'.format(attribute_name)}, status_code
            return func(*args, **kwargs)
        return decorated
    return decorator

@optional_decorator
def valid_project(f=None, id_key='project_id', roles=None, public_ok=False, private_ok=False, only=None, raw=False,
                  optional=False, include=None):
    """ Ensures that the wrapped resource method can only be called by members of the organization specified in
    the wrapped function under the `organization_id` argument.
    :param f:
    :param id_key:
    :param roles:       A list of roles that needs to be fulfilled by a given
                        user to access this project (e.g. admin, owner).  Each
                        element of the list can be a role name, or again list
                        of role names, in which case it will be checked if the
                        user has any of the given roles (like an OR rule).
    :param private_ok:  If set to `True`, wiil bypass the role checking for
                        this project entirely.
    :param public_ok:   If set to `True`, will bypass the role checking for
                        this project if the project is public (i.e. if the
                        project contains a `public = True` entry).
    :param only: passed as a parameter to backend when getting the project
    :param raw: passed as a parameter to backend when getting the project
    :param optional: passed as a parameter to backend when getting the project
    :param include: passed as a parameter to backend when getting the project
    :return: (return value, status code) tuple
    """

    if only is None:
        only = {'stats': False}

    if roles is None:
        roles = ('admin', 'collaborator', 'owner')

    @wraps(f)
    @requires_request_attribute("user")
    def decorated_function(*args, **kwargs):

        if id_key not in kwargs or kwargs[id_key] is None:
            request.project = None
            if not optional:
                return {'message': 'no project was specified'}, 404
            return f(*args, **kwargs)
        try:

            project_id = kwargs[id_key]

            project = backend.get(Project, {
                '$or': [
                    {'pk': project_id},
                    {'permalink': project_id}
                ]},
                raw=raw, only=only, include=include)

            if project.get('delete', False):
                return {'message': 'project marked for deletion'}, 422

            # We get all organizations where the user is an owner
            if not private_ok and not (public_ok and project.get('public', False)):
                if request.user is None or not project.is_authorized(request.user, roles=roles):
                    return {'message': 'Authorization denied'}, 403

        except Project.DoesNotExist:
            return {'message': 'Invalid project'}, 404

        request.project = project
        return f(*args, **kwargs)

    return decorated_function


@optional_decorator
def valid_issue_class(f=None, id_key='issue_class_id',
                      include=('tags', 'categories')):
    """
    :param f:
    :param id_key:
    :param include:
    :return:
    """
    @wraps(f)
    @requires_request_attribute("user")
    def decorated_function(*args, **kwargs):

        if id_key not in kwargs:
            return {'message': 'you must specify an issue class ID'}, 404
        issue_class_id = kwargs[id_key]
        try:
            issue_class = backend.get(
                IssueClass,
                {'$or': [
                    {'pk': issue_class_id},
                    {'code': issue_class_id}
                ]},
                include=include)

        except IssueClass.DoesNotExist as e:
            return {'message': e.message if e.message else 'invalid issue class'}, 404

        request.issue_class = issue_class
        return f(*args, **kwargs)

    return decorated_function


@optional_decorator
def valid_issue(f=None, id_key='issue_id', include=()):
    """
    :param f:
    :param id_key:
    :param include:
    :return:
    """
    @wraps(f)
    @requires_request_attribute("user")
    def decorated_function(*args, **kwargs):

        if id_key not in kwargs:
            return {'message': 'you must specify an issue ID'}, 404
        issue_id = kwargs[id_key]
        try:
            issue = backend.get(
                Issue,
                {'pk' : issue_id},
                include=include)

        except Issue.DoesNotExist as e:
            return {'message': e.message if e.message else 'invalid issue'}, 404

        #we make sure the issue belongs to the project for which the user is authenticated
        if issue.project != request.project:
            return {'message': 'access denied'}, 403

        request.issue = issue
        return f(*args, **kwargs)

    return decorated_function

@optional_decorator
def valid_diff(f=None, id_key_a='snapshot_a_id', id_key_b='snapshot_b_id', only=None, include=None, raw=False,
               store_as='diff'):
    """
    :param f:
    :param id_key_a: parameter name in the wrapped method where the id of snapshot a is stored
    :param id_key_b: parameter name in the wrapped method where the id of snapshot b is stored
    :param only: passed as a parameter to backend when getting the project
    :param include: passed as a parameter to backend when getting the project
    :param raw: passed as a parameter to backend when getting the project
    :param store_as: name of the attribute on the request object where diff will be stored at
    :return:
    """
    @wraps(f)
    @requires_request_attribute("project", status_code=404)
    @requires_request_attribute("user")
    def decorated_function(*args, **kwargs):

        snapshot_a_id = kwargs.get(id_key_a, '')
        snapshot_b_id = kwargs.get(id_key_b, '')
        try:
            snapshot_a = get_snapshot(request.project, snapshot_a_id, only=('pk',))
        except Snapshot.DoesNotExist as e:
            return {'message': e.message if e.message else 'invalid snapshot A'}, 404
        try:
            snapshot_b = get_snapshot(request.project, snapshot_b_id, only=('pk',))
        except Snapshot.DoesNotExist as e:
            return {'message': e.message if e.message else 'invalid snapshot B'}, 404

        try:
            diff = backend.get(Diff, {'snapshot_a.pk': snapshot_a['pk'],
                                      'snapshot_b.pk': snapshot_b['pk']}, include=include)
        except Diff.DoesNotExist as e:
            return {'message': e.message if e.message else 'invalid diff'}, 404

        setattr(request, store_as, diff)
        return f(*args, **kwargs)

    return decorated_function


@optional_decorator
def valid_snapshot(f=None, id_key='snapshot_id', only=None, include=None, raw=False, store_as='snapshot'):
    """
    :param f:
    :param id_key: parameter name in the wrapped method where the id of snapshot is stored
    :param only: passed as a parameter to backend when getting the project
    :param include: passed as a parameter to backend when getting the project
    :param raw: passed as a parameter to backend when getting the project
    :param store_as: name of the attribute on the request object where snapshot will be stored at
    :return:
    """
    if only is None:
        only = {'summary': False}

    @wraps(f)
    @requires_request_attribute("project", status_code=404)
    @requires_request_attribute("user")
    def decorated_function(*args, **kwargs):

        snapshot_id = kwargs.get(id_key, '')

        try:
            snapshot = get_snapshot(request.project, snapshot_id, raw=raw, only=only, include=include)
        except Snapshot.DoesNotExist as e:
            return {'message': e.message if e.message else 'invalid snapshot'}, 404

        setattr(request, store_as, snapshot)
        return f(*args, **kwargs)

    return decorated_function


@optional_decorator
def valid_file_revision(f=None, snapshot_id_key='snapshot_id', file_revision_id_key='file_revision_id',
                        path_key='path', only=None, raw=False):
    """
    :param f:
    :param snapshot_id_key:
    :param file_revision_id_key:
    :param path_key:
    :param only: passed as a parameter to backend when getting the project
    :param raw: passed as a parameter to backend when getting the project
    :return:
    """
    @wraps(f)
    @requires_request_attribute("project", status_code=404)
    @requires_request_attribute("user")
    def decorated_function(*args, **kwargs):

        if (snapshot_id_key in kwargs and
                path_key in kwargs and
                kwargs[snapshot_id_key] is not None and
                kwargs[path_key] is not None):
            try:
                snapshot = get_snapshot(request.project, kwargs[snapshot_id_key], raw=False)
            except Snapshot.DoesNotExist:
                return {'message': 'invalid snapshot'}, 404

            try:
                file_revision = backend.get(FileRevision, {
                    'snapshots': snapshot,
                    'path': kwargs[path_key],
                })
                request.file_revision = file_revision
            except (FileRevision.DoesNotExist, FileRevision.MultipleDocumentsReturned):
                    # TODO is multipledocumentsreturned a 404?
                    return {'message': 'invalid file revision'}, 404

        elif file_revision_id_key in kwargs:
            try:
                file_revision = backend.get(FileRevision, {
                    'pk': kwargs[file_revision_id_key],
                    'project': request.project,
                })
                request.file_revision = file_revision
            except FileRevision.DoesNotExist:
                return {'message': 'invalid file revision'}, 404
        else:
            return {'message': 'you must specify either a snapshot ID and path or a file revision ID'}, 404

        return f(*args, **kwargs)

    return decorated_function


@optional_decorator
def valid_user(f=None, anon_ok=False, raw=False, only=None, superuser=False, include=None):
    """ Used on resources which require request.user to be set.
    :param f: function to decorate
    :param anon_ok: if True the endpoint will also allow access to users who are not logged in
    :param raw: provided as a parameter to backend when getting the user
    :param only: provided as a parameter to backend when getting the user
    :param superuser: if True to user must be a superuser to get access to the endpoint
    :param include: provided as a parameter to backend when getting the user
    :return: decorated function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        def process_anonymously():
            request.user = None
            request.access_token = None
            return f(*args, **kwargs)

        def invalid_token(message, status_code=401, cookie_token=False):
            response = jsonify({'message': message})
            if cookie_token:
                response.set_cookie('access_token', '', expires=0)
            return response, status_code

        cookie_token = False
        if request.args.get('access_token'):
            access_token_key = request.args['access_token']
        elif request.cookies.get('access_token'):
            access_token_key = request.cookies['access_token']
            cookie_token = True
        else:
            authorization = request.headers.get('Authorization', '')
            match = re.match(r"^bearer\s+([\w\d]+)$", authorization, re.I)
            if not match:
                if anon_ok:
                    return process_anonymously()
                return {'message': 'Authorization header not valid'}, 401
            access_token_key = match.group(1)
        try:
            access_token = backend.get(AccessToken, {'token': access_token_key})

        except AccessToken.DoesNotExist:
            if anon_ok:
                return process_anonymously()
            # redirect to login
            return invalid_token('Invalid / expired access token: %s' % access_token_key, cookie_token=cookie_token)
        request.access_token = access_token
        try:
            request.user = backend.get(User, {'pk': access_token.user['pk']}, raw=raw, only=only, include=include)
        except User.DoesNotExist:
            with backend.transaction():
                backend.delete(access_token)
            return invalid_token('User does not exist', status_code=404, cookie_token=cookie_token)

        if superuser and not request.user.is_superuser():
            return {'message': 'This endpoint requires super-user privileges. Sorry :/'}, 401

        return f(*args, **kwargs)

    return decorated_function
