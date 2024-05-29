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




from quantifiedcode.settings import settings, backend
from quantifiedcode.backend.models import Snapshot

def get_snapshot(project, snapshot_id, raw=True, only=None, include=None):
    """
    Returns the snapshot corresponding to a given ID.
    Uses providers set by the plugins.
    :param snapshot_id: id of the snapshot to retrieve, can be empty??
    :param raw: backend param
    :param only: backend param
    :param include: backend param
    :return: snapshot
    """

    #we try to retrieve the snapshot by PK...

    try:
        snapshot = backend.get(Snapshot,{'pk' : snapshot_id}, include=include, only=only, raw=raw)
        return snapshot
    except Snapshot.DoesNotExist:
        pass

    for params in settings.providers['snapshot.resolve']:
        #if not params['source'] == project.source:
        #    continue #this is not the right provider...
        snapshot = params['provider'](project, snapshot_id, raw=raw, only=only, include=include)
        if snapshot is not None:
            return snapshot

    raise Snapshot.DoesNotExist("Could not resolve snapshot ID {}".format(snapshot_id))
