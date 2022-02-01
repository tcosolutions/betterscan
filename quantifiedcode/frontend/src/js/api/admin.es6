import { render }  from 'react-dom';
import Utils from "utils"
import Subject from "subject"

export default {

    getCelery(onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/admin/celery",
            success : onSuccess,
            error : onError
        })
    },

    getSettings(onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/settings",
            success : onSuccess,
            error : onError
        })
    },

    getData(onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/admin/data",
            success : onSuccess,
            error : onError
        })
    },

    getTasks(onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/admin/tasks",
            success : onSuccess,
            error : onError
        })
    }
}
