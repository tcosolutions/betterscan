import { render }  from 'react-dom';
import AdminApi from "api/admin"
import FileRevisionApi from "api/file_revision"
import IssueApi from "api/issue"
import IssueClassApi from "api/issue_class"
import ProjectApi from "api/project"
import SnapshotApi from "api/snapshot"
import TaskApi from "api/task"
import DiffApi from "api/diff"
import UserApi from "api/user"
import SubscriptionApi from "api/subscription"

export default {
    admin : AdminApi,
    fileRevision : FileRevisionApi,
    issue : IssueApi,
    project : ProjectApi,
    snapshot : SnapshotApi,
    task : TaskApi,
    diff: DiffApi,
    user : UserApi,
    issueClass : IssueClassApi,
    subscription: SubscriptionApi
}
