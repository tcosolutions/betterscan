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

    Contains functions used for analysis of Git projects.

"""





import logging
import datetime

from checkmate.contrib.plugins.git.commands.analyze import Command as AnalyzeCommand
from checkmate.contrib.plugins.git.commands.update_stats import Command as UpdateStatsCommand

from quantifiedcode.settings import settings, backend

logger = logging.getLogger(__name__)

def analyze(project):
    """ Actual analysis step of the analysis process. Analyzes the given project.
    :param project: project to analyze
    :return:
    """

    repository = project.git.repository
    branches = repository.get_branches()
    remote_name = "origin"

    logger.info("Found {} branches: {}".format(len(branches), ", ".join(branches)))

    branches_with_commit_date = {}

    default_branch = project.git.get_default_branch()
    if default_branch is None:
        return
    for branch in sorted(branches, key=lambda b: 0 if b == default_branch else 1):

        if not branch.startswith(remote_name + "/"):
            logger.warning("Not on the same remote, ignoring branch {}...".format(branch))
            continue

        if branch.startswith(remote_name + '/__'):  # we ignore branches with special names
            logger.warning("Ignoring branch {}...".format(branch))
            continue

        try:
            last_commit = repository.get_commits(branch, limit=1)[0]
        except IndexError:
            logger.warning("Did not find any commits in branch {}...".format(branch))
            continue

        logger.info("Last commit date: {}".format(last_commit['committer_date']))
        branches_with_commit_date[branch] = last_commit['committer_date']

    # Analyze only the 10 most recently active branches...
    def sorting_key(branch_with_commit_date):
        """ Used to sort branches_with_commit_date to prioritize default branches first, and then commit timestamps,
        newest commits first. Must be used with reverse=True. """
        branch, commit_date = branch_with_commit_date
        return commit_date

    logger.info(branches_with_commit_date)

    sorted_branches_with_commit_date = sorted(iter(branches_with_commit_date.items()), key=sorting_key, reverse=True)
    recently_active_branches = [branch for branch, commit_date in sorted_branches_with_commit_date
                                if (datetime.datetime.now() - commit_date < datetime.timedelta(days=30))]

    logger.info("Recently active branches: {}".format(", ".join(recently_active_branches)))
    for branch in [default_branch] + recently_active_branches[:10]:
        analyze_branch(project, branch)


def analyze_branch(project,
                   branch,
                   snapshots_per_run=2,
                   runs=2,
                   analysis_types=("latest", "daily", "weekly"),
                   shas=None,
                   diffs=None):
    """ Analyzes the given branch of the given project.
    :param project: project to analyze
    :param branch: branch to analyze
    :param snapshots_per_run: number of snapshots to create per run
    :param runs: number of runs to perform
    :param analysis_types: types of analysis to perform
    :param shas: list of shas
    :param diffs: list of diffs
    :return:
    """
    checkmate_settings = settings.checkmate_settings
    logger.info("Analyzing branch: {}".format(branch))

    for analysis_type in analysis_types:

        for i in range(runs):

            opts = {
                'n': snapshots_per_run,
                'offset': max(i * snapshots_per_run - 1, 0),
                'branch': branch,
                'shas': ','.join(shas) if shas is not None else '',
                'diffs': diffs,
                'type': analysis_type
            }

            analyze_command = AnalyzeCommand(project, settings.checkmate_settings, backend)
            analyze_command.opts.update(opts)
            analyze_command.run()

            #todo: call new analysis results available hook

    #send_immediate_notifications(project.pk, branch)

def update_project_statistics(project):
    """ After analysis hook. Updates the project statistics
    :param project: project that is being analyzed
    """

    checkmate_settings = settings.checkmate_settings

    update_stats_command = UpdateStatsCommand(project, checkmate_settings, backend)
    update_stats_command.run()

    if 'stats' in project:
        with backend.transaction():
            backend.update(project, ['stats'])
