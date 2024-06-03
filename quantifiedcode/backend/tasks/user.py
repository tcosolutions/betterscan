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

    Contains celery tasks for Git

"""





import logging
import traceback

from quantifiedcode.settings import settings, backend

from ..worker import celery
from ..models import Project, UserRole, User, AccessToken
from .helpers import ExclusiveTask, TaskLogger

logger = logging.getLogger(__name__)

@celery.task(queue="analysis", ignore_result=False)
def delete_user(user_id, task_id=None):
    """
    What we need to do here:

    -Remove all user data from database, unless user was customer
        - Projects
        - User profile
        - AccessToken

    """
    if not task_id:
        task_id = delete_user.request.id

    try:
        user = backend.get(User, {'pk': user_id})
    except User.DoesNotExist:
        logger.error("User {} does not exist! Cannot delete it.".format(user_id))
        return

    try:
        with ExclusiveTask(
                backend,
                {'type': {'$in': ['delete_{}'.format(user.pk)]}},
                {'type': 'delete_{}'.format(user.pk)},
                task_id,
                no_update_on_exit=True
        ) as delete_task:

            with TaskLogger(delete_task, backend=backend, ping=True):
                with backend.transaction():
                    logger.debug("Starting deletion of user {0} ({1}).".format(user.name, user.pk))

                    # Delete all related models
                    backend.filter(UserRole, {'user': user}).delete()
                    backend.filter(AccessToken, {'user': user}).delete()
                    backend.filter(User, {'pk': user.pk}).delete()

                    # Todo: Delete all of the user's projects that have no "owner" user roles anymore...

                logger.info("Deletion of user {0} ({1}) complete!".format(user.name, user.pk))

    except ExclusiveTask.LockError:
        pass
    except BaseException as err:
        logger.error("Error {0}: Can't delete user {1}.".format(err.__class__.__name__, user))
        logger.error(traceback.format_exc())
