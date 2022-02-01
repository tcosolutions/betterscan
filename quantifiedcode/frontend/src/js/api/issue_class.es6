import { render }  from 'react-dom';
import Utils from "utils"
import Settings from "settings"

export default {

    getTags(query,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/tags?"+Utils.toUrlParams(query),
            success : onSuccess,
            error: onError
            })
    },

    addTag(projectId,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'POST',
            url : "/project/"+projectId+"/tags",
            data : data,
            success : onSuccess,
            error: onError
            })
    },

    removeTag(projectId,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'DELETE',
            url : "/project/"+projectId+"/tags",
            data : data,
            success : onSuccess,
            error: onError
            })
    },

    updateIssueClass(issueClassId,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'PUT',
            url : "/issue_class/"+issueClassId,
            data : data,
            success : onSuccess,
            error: onError
            })
    },

    publishIssueClass(issueClassId,published,onSuccess,onError){
        return Utils.apiRequest({
            type : published ? 'POST' : 'DELETE',
            url : '/issue_class/'+issueClassId+'/publish',
            success : onSuccess,
            error: onError
            })
    },

    getIssueClasses(data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/issue_classes?"+Utils.toUrlParams(data),
            success: onSuccess,
            error: onError
            })
    },

    getDetails(issueClassId,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/issue_class/"+issueClassId,
            data : data,
            success: onSuccess,
            error: onError
            })
    },

    addIssueClassToProject(projectId,issueClassId,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'POST',
            url : "/project/"+projectId+"/issue_class/"+issueClassId,
            data : data,
            success: onSuccess,
            error: onError
            })
    },

    removeIssueClassFromProject(projectId,issueClassId,onSuccess,onError){
        return Utils.apiRequest({
            type : 'DELETE',
            url : "/project/"+projectId+"/issue_class/"+issueClassId,
            success: onSuccess,
            error: onError
            })
    },
}
