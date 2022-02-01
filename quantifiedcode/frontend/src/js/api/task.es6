import { render }  from 'react-dom';
import Utils from "utils"

export default {
    getTasks(projectId,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+"/tasks",
            success : onSuccess,
            error : onError
        })
    },

    getDetails(projectId,taskId,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+"/task/"+taskId,
            success : onSuccess,
            error : onError
        })
    },

    getLog(projectId,taskId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+"/task/"+taskId+"/log"+(params ? "?" + Utils.toUrlParams(params) : ""),
            success : onSuccess,
            error : onError
        }, {cached: false})
    }
}
