import { render }  from 'react-dom';
import Utils from "utils"

export default {

    getUser(params, onSuccess, onError) {
        var url = "/user"
        return Utils.apiRequest(
            {
                type: 'GET',
                url: url + (params ? '?' + Utils.toUrlParams(params) : ''),
                success: onSuccess,
                error: onError
            },
            {cached: true}
        )
    },

    getUsers(params,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/users?"+Utils.toUrlParams(params),
            success : onSuccess,
            error : onError
        },{cached: true})
    },

    logout(onSuccess,onError) {
        return Utils.apiRequest({
            type : 'POST',
            url : "/logout",
            success : onSuccess,
            error : onError
        })
    },

    login(data,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'POST',
            url : "/login",
            data : data,
            success : onSuccess,
            error : onError
        })
    },

    signup(data,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'POST',
            url : "/signup",
            data : data,
            success : onSuccess,
            error : onError
        })
    },

    validateEmail(email_auth_code,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/user/validate/"+email_auth_code,
            success : onSuccess,
            error : onError
        },{cached : false})
    },

    changePassword(data, onSuccess, onError) {
        return Utils.apiRequest({
            type : 'PUT',
            url : "/user/password",
            data : data,
            success : onSuccess,
            error : onError
        })
    },

    requestPasswordReset(data,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'POST',
            url : "/user/reset",
            data : data,
            success : onSuccess,
            error : onError
        })
    },

    resetPassword(data,password_reset_code,onSuccess,onError) {
        return Utils.apiRequest({
            type : 'POST',
            url : "/user/reset/"+password_reset_code,
            data : data,
            success : onSuccess,
            error : onError
        })
    },

    updateUser(data, onSuccess, onError) {
        return Utils.apiRequest({
            type : 'PUT',
            url : "/user",
            data : data,
            success : onSuccess,
            error : onError
        })
    },

    deleteUser(data, onSuccess, onError) {
        return Utils.apiRequest({
            type : 'DELETE',
            url : "/user",
            data : data,
            success : onSuccess,
            error : onError
        })
    },

    getEmailSettings(onSuccess, onError) {
        return Utils.apiRequest({
            type : 'GET',
            url : "/user/email_settings",
            success : onSuccess,
            error : onError
            })
    },

    updateEmailSettings(data, onSuccess, onError) {
        return Utils.apiRequest({
            type : 'PUT',
            url : "/user/email_settings",
            data : data,
            success : onSuccess,
            error : onError
            })
    }
}
