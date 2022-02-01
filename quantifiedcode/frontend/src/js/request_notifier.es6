import { render }  from 'react-dom';
import Utils from "utils"
import Subject from "subject"

class RequestNotifier extends Subject {
    constructor(){
        super()
        this.currentRequests = {}
        this.requestCount = 0
        this.retryInterval = 1
    }

    register(requestId, data) {
        this.currentRequests[requestId] = {
            registeredAt: new Date(),
            data: data
        }
        this.notify("registerRequest", requestId)
        this.notify("activeRequestCount", this.activeRequestCount())
        return requestId
    }

    success(requestId, data) {
        if (requestId in this.currentRequests)
            delete this.currentRequests[requestId]
        this.notify("requestSucceeded", {
            requestId: requestId,
            data: data
        })
        this.notify("activeRequestCount", this.activeRequestCount())
    }

    error(requestId, xhr, data, e) {
        if (requestId in this.currentRequests)
            delete this.currentRequests[requestId]
        if (xhr.readyState == 0) {
            var requestData = Utils.requestData(requestId)
            if (requestData == undefined)
                return
            this.notify("connectionError", {
                requestId: requestId,
                xhr: xhr,
                data: data,
                requestData: requestData,
                e: e
            })
        } else {
            this.notify("requestFailed", {
                requestId: requestId,
                xhr: xhr,
                data: data,
                e: e
            })
        }
        this.notify("activeRequestCount", this.activeRequestCount())
    }

    activeRequestCount(requestId) {
        return Object.keys(this.currentRequests).length
    }
}

var instance

function getInstance() {
    if (instance === undefined)
        instance = new RequestNotifier()
    return instance
}

export default {
    getInstance: getInstance
}
