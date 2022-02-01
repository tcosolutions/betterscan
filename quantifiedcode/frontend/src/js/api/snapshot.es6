import { render }  from 'react-dom';
import Utils from "utils"

export default {

    getIssues(projectId,snapshotId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/snapshot/'+snapshotId+'/issues'+(params.path !== undefined ? '/'+params.path : '')+'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getFileRevisionIssues(projectId,snapshotId,path,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/snapshot/'+snapshotId+'/file_revision_issues'+(path !== undefined ? '/'+path : '')+'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getFileRevisionDetails(projectId,snapshotId,path,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/snapshot/'+snapshotId+'/file_revision/'+(path !== undefined ? path : '')+'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getIssuesSummary(projectId,snapshotId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/snapshot/'+snapshotId+'/issues_summary'+(params.path !== undefined ? '/'+params.path : '')+'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getTree(projectId,snapshotId,path,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/snapshot/'+snapshotId+'/tree'+(path !== undefined ? '/'+path : '')+'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getDetails(projectId,snapshotId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+"/snapshot/"+snapshotId+'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getSummary(projectId,snapshotId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+"/snapshot/"+snapshotId+"/summary?"+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getGraph(projectId,snapshotId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+"/snapshot/"+snapshotId+"/graph?"+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    }

}
