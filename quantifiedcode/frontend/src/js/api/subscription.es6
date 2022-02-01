import { render }  from 'react-dom';
import Utils from "utils"

export default {
    getUserSubscriptions(params, onSuccess, onError) {
        return Utils.apiRequest({
            type: "GET",
            url: "/user/subscriptions" + (params ? "?" + Utils.toUrlParams(params) : ""),
            success: onSuccess,
            error: onError
        });
    },

    updateUserSubscription(data, onSuccess, onError) {
        return Utils.apiRequest({
            type: "PUT",
            url: "/user/subscriptions",
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: onSuccess,
            error: onError
        });
    },
    
    updateUserBilling(data, onSuccess, onError) {
        return Utils.apiRequest({
            type: "PUT",
            url: "/user/billing",
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: onSuccess,
            error: onError
        });
    },


    getOrganizationSubscriptions(organizationId, params, onSuccess, onError) {
        return Utils.apiRequest({
            type: "GET",
            url: "/organization/"+organizationId+"/subscriptions" + (params ? "?" + Utils.toUrlParams(params) : ""),
            success: onSuccess,
            error: onError
        });
    },

    updateOrganizationSubscription(organizationId, data, onSuccess, onError) {
        return Utils.apiRequest({
            type: "PUT",
            url: "/organization/"+organizationId+"/subscriptions",
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: onSuccess,
            error: onError
        });
    }
}
