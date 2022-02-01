import Utils from "utils"

export default {

    create(data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'POST',
            url : "/project/git",
            data : data,
            success : onSuccess,
            error: onError
            });
    },

    update(projectId, data, onSuccess, onError){
        return Utils.apiRequest({
            type : 'PUT',
            url : "/project/git/"+projectId,
            data : data,
            success : onSuccess,
            error: onError
            });
    },

    getGitSnapshots(projectId,branch,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/git_snapshots/'+branch+'?'+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            });
    }
}
