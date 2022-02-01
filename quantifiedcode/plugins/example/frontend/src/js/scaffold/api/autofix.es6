import Utils from "utils"

export default {
    order(projectId, /*optional*/ branch, issueId, onSuccess, onError) {
        return Utils.apiRequest({
            type : 'POST',
            url : "/project/"+projectId+"/autofix/"+issueId+(branch !== undefined ? '/'+branch : ''),
            success : onSuccess,
            error : onError,
        });
    }
}
