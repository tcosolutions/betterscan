import { render }  from 'react-dom';
import Utils from "utils"

export default {
    getDetails(projectId,fileRevisionId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/file_revision/'+fileRevisionId+'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error : onError
            })
    },

    getDetailsByPath(projectId,snapshotId,path,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/file_revision/'+snapshotId+(path[0] === '/' ? path : "/"+path) +'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error : onError
            })
    },

    getCodeObjects(projectId,fileRevisionId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/file_revision/'+fileRevisionId+'/code_objects?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getIssues(projectId,fileRevisionId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/file_revision/'+fileRevisionId+'/issues?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getIssuesByPath(projectId,snapshotId,path,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/file_revision/'+snapshotId+'/issues'+(path[0] === '/' ? path : "/"+path) +'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getIssuesSummary(projectId,fileRevisionId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/file_revision/'+fileRevisionId+'/issues_summary?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getIssuesSummaryByPath(projectId,snapshotId,path,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/file_revision/'+snapshotId+'/issues_summary'+(path[0] === '/' ? path : "/"+path)+'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getCode(projectId,fileRevisionId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/file_revision/'+fileRevisionId+'/code?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    }
}
