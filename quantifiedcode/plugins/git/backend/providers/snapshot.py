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
import re
from subprocess import CalledProcessError

from quantifiedcode.settings import backend
from quantifiedcode.backend.models import Snapshot
from ..models import GitSnapshot, GitBranch
import pprint

def resolve(project, snapshot_id, raw=False, only=None, include=None):

    #we check if the project has an associated GitRepository object. If not, we move on
    try:
        git = project.git.eager
    except project.git.DoesNotExist:
        return None

    branch_name = None

    if not snapshot_id or snapshot_id == ":HEAD":
        snapshot_id, branch_name = get_default_snapshot_id(project)

    if snapshot_id is None:
        raise Snapshot.DoesNotExist("No snapshot_id defined!")

    match = re.match(r"(?:([^:]+):(.*)):HEAD(?: ~(\d+))?$", snapshot_id, re.I)

    if match:
        remote = match.group(1)
        branch_name = match.group(2).replace(':', '/')
        count = match.group(3)
        count = int(count) if count else 0

        try:
            branch_name = "%s/%s" % (remote, branch_name)
            if count == 0:
                try:
                    branch = backend.get(GitBranch,
                                         {'name': branch_name, 'project': project},
                                         include=(('head_snapshot',('snapshot','pk')),))
                    if branch.head_snapshot is not None:
                        snapshot = backend.get(Snapshot,
                                               {'pk' : branch.head_snapshot.snapshot.pk},
                                               include=include,
                                               only=only,
                                               raw=raw)
                        snapshot['branch'] = branch
                        return snapshot
                except (GitBranch.DoesNotExist, Snapshot.DoesNotExist):
                    pass
            try:
                git_snapshots = git.get_snapshots(branch=branch_name, limit=100)
            except:
                raise IndexError
            pprint.pprint(git_snapshots)
            if git_snapshots:
                snapshots = backend.filter(Snapshot, {
                    'project': project,
                    'git_snapshot.sha': {'$in': [snp['sha'] for snp in git_snapshots]}
                }, raw=raw, include=include, only=only)
                pprint.pprint(snapshots)
            else:
                snapshots = []
            snapshot = snapshots[count]
            snapshot['branch'] = branch
            return snapshot
        except IndexError:
            raise Snapshot.DoesNotExist("No snapshots in branch %s" % branch_name)
        except GitBranch.DoesNotExist:
            raise Snapshot.DoesNotExist("invalid branch specified: %s" % branch_name)

    try:
        snapshot = backend.get(Snapshot,
                               {'git_snapshot.pk': snapshot_id, 'project': project},
                               raw=raw,
                               include=include,
                               only=only)

    except Snapshot.DoesNotExist:
        snapshot = backend.get(Snapshot,
                               {'git_snapshot.sha': snapshot_id, 'project': project},
                               raw=raw,
                               include=include,
                               only=only)
    snapshot['branch'] = None
    return snapshot


def get_default_snapshot_id(project):
    """ Generate a snapshot id from data on the given project.
    :param project: project object
    :return: snapshot id
    """
    def snapshot_id_from_branch_name(name):
        return "{}:HEAD".format(name.replace('/', ':'))

    default_branch = project.git.get_default_branch()
    if default_branch is None:
        return None, None
    snapshot_id = snapshot_id_from_branch_name(default_branch)
    return snapshot_id, default_branch
