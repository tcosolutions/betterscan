import { render }  from 'react-dom';
import Utils from "utils"

export default {

    getList(projectId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type: 'GET',
            url: "/github/projects/"+projectId+'/pull_requests?'+Utils.toUrlParams(params),
            success: onSuccess,
            error: onError
        });
    },

    getDetails(projectId,pullRequestId,onSuccess,onError) {
        return Utils.apiRequest({
            type: 'GET',
            url: "/github/projects/"+projectId+"/pull_request/"+pullRequestId,
            success: onSuccess,
            error: onError
        });
    }

}
