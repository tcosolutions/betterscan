# -*- coding: utf-8 -*-

from .user import (
    ChangeUserPassword,
    UserLogin,
    UserLogout,
    UserSignup,
    UserProfile,
    EmailValidation,
    PasswordResetRequest,
    PasswordReset,
    Users,
    UserException,
    EmailSettings,
    Settings
)

from .project import (
    ProjectDetails,
    Projects,
    ProjectAnalysis,
    ProjectRoles,
    ProjectTags
)

from .public_projects import PublicProjects

from .diff import (
    DiffDetails,
    DiffIssuesSummary,
    DiffFileRevisionIssues
)

from .auth_token import AuthToken

from .snapshot import (
    SnapshotFileRevisionIssues,
    SnapshotSummary,
    SnapshotIssuesSummary,
    SnapshotDetails,
    SnapshotFileRevisionContent
)

from .file_revision import (
    FileRevisionDetails,
    FileRevisionContent,
)

from .badge import Badge

from .issue import (
    IssuesData,
    IssueStatus
)

from .task import (
    TaskDetails,
    TaskLog,
    Tasks,
)

from .issue_class import (
    IssueClasses,
    ProjectIssueClasses
)

routes = [

    # User login, signup and subscription
    {'/login': [UserLogin, {'methods': ["POST"]}]},
    {'/logout': [UserLogout, {'methods': ["POST"]}]},
    {'/signup': [UserSignup, {'methods': ["POST"]}]},
    {'/user': [UserProfile, {'methods': ["GET", "PUT", "DELETE"]}]},
    {'/user/password': [ChangeUserPassword, {'methods': ["PUT"]}]},
    {'/user/validate/<email_validation_code>': [EmailValidation, {'methods': ["GET"]}]},
    {'/user/reset': [PasswordResetRequest, {'methods': ["POST"]}]},
    {'/user/reset/<password_reset_code>': [PasswordReset, {'methods': ["POST"]}]},
    {'/authorize/token/<service_name>': [AuthToken, {'methods': ["GET"]}]},
    {'/user/email_settings': [EmailSettings, {'methods': ["GET", "PUT"]}]},

    # Exception testing

    {'/exception': [UserException, {'methods': ["GET"]}]},

    # User List

    {'/users': [Users, {'methods': ["GET"]}]},

    # Admin
    {'/settings': [Settings, {'methods': ["GET"]}]},

    # Projects

    {'/project/<project_id>': [ProjectDetails, {'methods': ["GET", "PUT", "DELETE"]}]},
    {'/projects': [Projects, {'methods': ["GET"]}]},
    {'/project/<project_id>/user_roles': [ProjectRoles, {'methods': ["GET"]}]},
    {'/project/<project_id>/user_roles/<user_role_id>': [ProjectRoles, {'methods': ["DELETE"]}]},
    {'/project/<project_id>/user_roles/<role>/<user_id>': [ProjectRoles, {'methods': ["POST"]}]},

    # Project Tags

    {'/tags': [ProjectTags, {'methods': ["GET"]}]},
    {'/project/<project_id>/tags': [ProjectTags, {'methods': ["POST", "DELETE"]}]},

    # Trigger analysis of project or get analysis details
    {'/project/<project_id>/analyze': [ProjectAnalysis, {'methods': ["GET", "POST", "DELETE"]}]},

    # Diff details
    {'/project/<project_id>/diff/<snapshot_a_id>/<snapshot_b_id>': [DiffDetails, {'methods': ["GET"]}]},
    {'/project/<project_id>/diff/<snapshot_a_id>/<snapshot_b_id>/issues_summary': [DiffIssuesSummary, {'methods': ["GET"]}]},
    {'/project/<project_id>/diff/<snapshot_a_id>/<snapshot_b_id>/file_revision_issues': [DiffFileRevisionIssues, {'methods': ["GET"]}]},
    {'/project/<project_id>/diff/<snapshot_a_id>/<snapshot_b_id>/file_revision_issues/<regex(".*$"):path>': [DiffFileRevisionIssues, {'methods': ["GET"]}]},
    # Snapshot Summary

    {'/project/<project_id>/snapshot/<snapshot_id>/summary': [SnapshotSummary, {'methods': ["GET"]}]},
    {'/project/<project_id>/snapshot/<snapshot_id>/issues_summary': [SnapshotIssuesSummary, {'methods': ["GET"]}]},

    # Snapshot details & issues

    {'/project/<project_id>/snapshot/<snapshot_id>/file_revision_issues': [SnapshotFileRevisionIssues, {'methods': ["GET"]}]},
    {'/project/<project_id>/snapshot/<snapshot_id>/file_revision_issues/<regex(".*$"):path>': [SnapshotFileRevisionIssues, {'methods': ["GET"]}]},
    {'/project/<project_id>/snapshot/<snapshot_id>/code/<regex(".*$"):path>': [SnapshotFileRevisionContent, {'methods': ["GET"]}]},
    {'/project/<project_id>/snapshot/<snapshot_id>': [SnapshotDetails, {'methods': ["GET"]}]},

    # File Revision Details

    {'/project/<project_id>/file_revision/<file_revision_id>': [FileRevisionDetails, {'methods': ["GET"]}]},
    {'/project/<project_id>/snapshot/<snapshot_id>/file_revision/<regex(".*$"):path>': [FileRevisionDetails, {'methods': ["GET"]}]},
    {'/project/<project_id>/file_revision/<file_revision_id>/code': [FileRevisionContent, {'methods': ["GET"]}]},

    # Issues

    {'/project/<project_id>/issues_data': [IssuesData, {'methods': ["GET"]}]},
    {'/project/<project_id>/issue/<issue_id>/status': [IssueStatus, {'methods': ["PUT"]}]},
    {'/project/<project_id>/badge.svg': [Badge, {'methods': ["GET"]}]},
    {'/project/<project_id>/snapshot/<snapshot_id>/badge.svg': [Badge, {'methods': ["GET"]}]},

    # Tasks

    {'/project/<project_id>/tasks': [Tasks, {'methods': ["GET"]}]},
    {'/project/<project_id>/task/<task_id>': [TaskDetails, {'methods': ["GET"]}]},
    {'/project/<project_id>/task/<task_id>/log': [TaskLog, {'methods': ["GET"]}]},

    # Issue Classes

    {'/issue_classes': [IssueClasses, {'methods': ["GET"]}]},
    {'/project/<project_id>/issue_class/<issue_class_id>': [ProjectIssueClasses, {'methods': ["POST","DELETE"]}]},

    # Public Projects
    {'/public-projects': [PublicProjects, {'methods': ["GET"]}]},
]

new_routes = []
prefix = "/v1"

for route in routes:
    new_routes.append({prefix + key: value for key, value in route.items()})

routes = new_routes
