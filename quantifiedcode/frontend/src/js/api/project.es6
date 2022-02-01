import { render }  from 'react-dom';
import Utils from "utils"
import Subject from "subject"
import Settings from "settings"

export default {

    updateProject(projectId,data,onSuccess,onError){
        return Utils.apiRequest({
            type : 'PUT',
            url : "/project/"+projectId,
            data : data,
            success : onSuccess,
            error: onError
            })
    },

    addRole(projectId,role,userId,onSuccess,onError){
        return Utils.apiRequest({
            type : 'POST',
            url : "/project/"+projectId+'/user_roles/'+role+'/'+userId,
            success : onSuccess,
            error: onError
            },{cached : false})
    },

    getRoles(projectId,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'/user_roles',
            success : onSuccess,
            error: onError
            },{cached : false})
    },

    removeRole(projectId,roleId,onSuccess,onError){
        return Utils.apiRequest({
            type : 'DELETE',
            url : "/project/"+projectId+'/user_roles/'+roleId,
            success : onSuccess,
            error: onError
            },{cached : false})
    },

    acceptRole(projectId,roleId,onSuccess,onError){
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+"/accept_ownership",
            success : onSuccess,
            error: onError
            },{cached : false})
    },

    declineRole(projectId,roleId,onSuccess,onError){
        return Utils.apiRequest({
            type : 'DELETE',
            url : "/project/"+projectId+"/accept_ownership",
            success : onSuccess,
            error: onError
            },{cached : false})
    },

    getPendingRoles(onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/user/pending_roles",
            success : onSuccess,
            error : onError
        },{cached: false})
    },

    analyze(projectId,onSuccess,onError){
        return Utils.apiRequest({
            type : 'POST',
            url : "/project/"+projectId+"/analyze",
            data : {},
            success: onSuccess,
            error: onError
            })
    },

    reset(projectId,onSuccess,onError){
        return Utils.apiRequest({
            type : 'DELETE',
            url : "/project/"+projectId+"/analyze",
            data : {},
            success: onSuccess,
            error: onError
            })
    },

    getDetails(projectId,params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/project/"+projectId+'?'+Utils.toUrlParams(params),
            success: onSuccess,
            error: onError
            })
    },

    deleteProject(projectId,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'DELETE',
            url : "/project/"+projectId,
            success : onSuccess,
            error: onError
            })
    },

    getUserProjects(params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/projects?"+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    },

    getPublicProjects(params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/public-projects?"+Utils.toUrlParams(params),
            success : onSuccess,
            error: onError
            })
    }

}
