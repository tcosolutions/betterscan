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
