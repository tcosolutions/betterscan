import { render }  from 'react-dom';
import Utils from "utils"

export default {
    getIssues(projectId,snapshotAId,snapshotBId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+"/diff/"+snapshotAId+"/"+snapshotBId+'/issues?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getFileRevisionIssues(projectId,snapshotAId,snapshotBId,path,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/diff/'+snapshotAId+'/'+snapshotBId+'/file_revision_issues'+(path !== undefined ? '/'+path : '')+'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getIssuesSummary(projectId,snapshotAId,snapshotBId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/diff/'+snapshotAId+'/'+snapshotBId+'/issues_summary'+(params.path !== undefined ? '/'+params.path : '')+'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    }
}
