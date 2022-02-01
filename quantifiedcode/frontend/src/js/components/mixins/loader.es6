import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import {makeUrl, A} from "routing"
import $ from "jquery"
import Apis from "api/all"
var quotes = [
    {
        m : 'There are two ways of constructing a software design: One way is to make it so simple that there are obviously no deficiencies and the other way is to make it so complicated that there are no obvious deficiencies.',
        a : 'C.A.R. Hoare, The 1980 ACM Turing Award Lecture'
    },
    {
        m : 'The computing scientist’s main challenge is not to get confused by the complexities of his own making.',
        a : 'E. W. Dijkstra'
    },
    {
        m : 'The cheapest, fastest, and most reliable components are those that aren’t there.',
        a : 'Gordon Bell'
    },
    {
        m : 'Beauty is more important in computing than anywhere else in technology because software is so complicated. Beauty is the ultimate defence against complexity.',
        a : 'David Gelernter'
    },
    {
        m : 'The central enemy of reliability is complexity.',
        a : 'Geer et. al.'
    },
    {
        m : 'Software is getting slower more rapidly than hardware becomes faster',
        a : 'Niklaus Wirth, A plea for lean software'
    },
    {
        m : 'Simplicity is prerequisite for reliability.',
        a : 'E. W. Dijkstra'
    },
    {
        m : 'First, solve the problem. Then, write the code.',
        a : 'John Johnson'
    }
]

var currentQuote = 0

var LoaderMixin = {

    updateLoadingState : function(role,state,noUpdate){
        if (!this.isMounted())
            return

        for (var key in this.loadingState){
            var list = this.loadingState[key]
            if (key == state){
                if (!(role in list))
                    list[role] = true
            } else if (role in list) {
                 delete list[role]
            }
        }
        if ((!Object.keys(this.loadingState.inProgress).length)){
            var loadingFailed = false
            var d = this.coerceData()
            var successCount = Object.keys(this.loadingState.succeeded).length
                              + Object.keys(this.loadingState.failedNonCritical).length
            if (this.resourcesList.length == successCount){
                if (this.afterLoadingSuccess) {
                    var res = this.afterLoadingSuccess(d)
                    if (res) {
                        d = res
                    }
                }
            }
            else
                loadingFailed = true
            this.setState({data : d,loadingInProgress : false,loadingFailed :loadingFailed})
        }
    },

    coerceData : function(){
        var d = {}
        for(var role in this.data){
            if (role in this.loadingState.succeeded)
                $.extend(d,this.data[role])
        }
        return d
    },

    onLoadingError : function(handler,role,nonCritical){
        return function(errorData){
            if(!this.isMounted()) {
              return
            }
            var stateErrorData = $.extend({}, this.state.errorData)
            stateErrorData[role] = errorData
            this.setState({errorData: stateErrorData})
            if (handler)
                handler.bind(this)(...arguments)
            if (nonCritical)
                this.updateLoadingState(role,"failedNonCritical")
            else
                this.updateLoadingState(role,"failed")
        }.bind(this)
    },

    updateResource : function(role,data,props){
        var resources = this.resources(props || this.props)
        for(var i in resources){
            var resource = resources[i]
            if (resource.name == role){
                this.onResourceSuccess(resource,data)
                break
            }
        }
    },

    onLoadingSuccess : function(handler,role){
        return function(){
            if (!this.isMounted())
                return
            if (this.state.errorData[role])
                delete this.state.errorData[role]
            var update = true
            if (arguments.length > 0)
            {
                var data = arguments[0]

                if (this.reload && data.__cached__)
                    update = false

                //bug :/
                //if (this.requestIds && this.requestIds[role] && data.__requestId__ && data.__requestId__ !== this.requestIds[role])
                //    update = false
            }
            //we call the success handler
            if (update){
                if (handler)
                    handler.bind(this)(...arguments)
                this.updateLoadingState(role,"succeeded")
            }
        }.bind(this)
    },

    onResourceSuccess : function(resource,data){
        var d = {}

        var mapping = resource.mapping
        if (!mapping){
            mapping = {}
            mapping[resource.name] = resource.name
        }
        for(var key in mapping){
            d[key] = data[mapping[key]]
        }

        if (resource.success)
        {
            var res = resource.success(data,d)
            if (res)
                $.extend(d,res)
        }

        this.data[resource.name] = d
    },

    processResourcesList : function(props){

        if (this.onLoadResources)
            this.onLoadResources(props)

        var resources = this.resourcesList

        if (!resources.length){
            this.setState({data : {},loadingInProgress : false,loadingFailed : false})
            return
        }
        var loadingList = []
        for(var i in resources){
            var resource = resources[i]
            if (resource.before)
                if (!resource.before(props,resource))
                    continue

            var params = []
            if (resource.params)
                params = resource.params.slice(0)

            params.push(this.onLoadingSuccess(this.onResourceSuccess.bind(this,resource),resource.name))
            params.push(this.onLoadingError(resource.error,resource.name,resource.nonCritical))
            this.updateLoadingState(resource.name,"inProgress")
            //we call the resource endpoint with the given parameters
            loadingList.push([resource,params])
        }
        //We call the endpoints of the resources to be loaded
        loadingList.map(function(p){
            var resource = p[0]
            var params = p[1]
            this.params[resource.name] = params
            this.endpoints[resource.name] = resource.endpoint
            if (this.reload ||
                (resource.alwaysReload || (!this.lastData[resource.name])) ||
                ((JSON.stringify(this.lastParams[resource.name]) != JSON.stringify(params))
                    || (resource.endpoint != this.lastEndpoints[resource.name]))){
                if (resource.endpoint)
                    this.requestIds[resource.name] = resource.endpoint.bind(this)(...params)
            }
            else{
                //we take the previous value
                this.data[resource.name] = $.extend({},this.lastData[resource.name])
                this.data[resource.name].__cached__ = false
                this.requestIds[resource.name] = this.lastData[resource.name].__requestId__
                this.updateLoadingState(resource.name,"succeeded")
            }
        }.bind(this))
    },


    reloadResources : function(){
        this.reload = true
        this.resetLoadingState()
        this.getResourcesList(this.props)
        this.processResourcesList(this.props)
    },

    resetLoadingState : function(){
        this.lastData = $.extend({},this.data)
        this.lastParams = $.extend({},this.params)
        this.lastEndpoints = $.extend({},this.endpoints)
        this.data = {}
        this.endpoints = {}
        this.params = {}
        this.loadingState = {
                inProgress : {},
                failed : {},
                failedNonCritical : {},
                succeeded : {},
            }
    },

    getInitialState : function(){
        return {
                loadingInProgress : true,
                loadingFailed : false,
                data : {},
                errorData: {}
               }
    },

    getResourcesList : function(props){
        this.resourcesList = this.resources(props) || []
    },

    componentWillMount : function(){
        this.apis = Apis
        this.data = {}
        this.params = {}
        this.endpoints = {}
        this.reload = false
        this.resourcesList = []
        this.requestIds = {}
        this._render = this.render
        this.render = this.renderLoader
        this.resetLoadingState()
        this.getResourcesList(this.props)
        //cast to boolean:
        this.showComponentWhileLoading = !!this.showComponentWhileLoading
    },

    componentWillReceiveProps : function(newProps){
        this.reload = false
        this.resetLoadingState()
        this.getResourcesList(newProps)
        this.processResourcesList(newProps)
    },

    componentDidMount : function(){
        this.processResourcesList(this.props)
    },

    renderLoader: function(){
        var loadingInProgress = this.state.loadingInProgress
        var loadingFailed = this.state.loadingFailed
        if (!this.resourcesList.length)
            loadingInProgress = false
        if (loadingFailed || (loadingInProgress && (!this.showComponentWhileLoading)))
            return this.showLoader()
        return this._render()
    },

    showLoader : function(){
        if (this.silentLoading)
            return <div></div>
        if (this.state.loadingFailed)
            return this.showErrorMessage()
        else
            return this.showLoadingMessage()
    },

    showErrorMessage : function(){

        var reload = function(e){
            e.preventDefault()
            location.reload()
        }.bind(this)
        if (this.renderErrorPage)
            return this.renderErrorPage(this.state.errorData)
        var loadingErrorMessage
        if (this.getErrorMessage)
            loadingErrorMessage = this.getErrorMessage(this.state.errorData)
        if (!loadingErrorMessage)
            loadingErrorMessage = 'The page you are trying to access cannot be loaded.'
        var loggedOutMessage
        if (this.inlineComponent)
            return <span className="alert alert-danger">{loadingErrorMessage}</span>
        else
            return <div className="e404">
                        <div className="row">
                            <div className="col-md-10 col-md-offset-1 text-center">
                                <h2>{loadingErrorMessage}</h2>
                                {loggedOutMessage}
                            </div>
                            <div className="col-md-6 col-md-offset-3">
                                <p className="text-center">
                                    Sorry for the inconvenience. Please try to reload this page. If the problem persists,
                                    contact us and we will try to fix it.
                                </p>
                            </div>
                            <div className="col-md-12 text-center">
                                <p>
                                    <a className="btn btn-primary space-right-10 space-bottom-10" onClick={reload}>Reload page</a>
                                </p>
                            </div>
                        </div>
                    </div>
    },

    showLoadingMessage : function(){
        currentQuote++

        if (this.renderLoadingPlaceholder)
            return this.renderLoadingPlaceholder()

        var loadingMessage
        if (this.getLoadingMessage)
            loadingMessage = this.getLoadingMessage()

        if (this.inlineComponent) {
            if (loadingMessage === undefined) loadingMessage = "Loading data ..."
            return <p className="inlineLoader"> {loadingMessage}</p>
        } else {
            if (loadingMessage === undefined) {
                loadingMessage = <div>
                      <div className="row">
                        <div className="col-xs-12">
                          <p>Please wait, loading data ...</p>
                          <hr />
                        </div>
                       </div>
                    </div>
            }
            return <div className="content">
                    <div className="text-center">
                        <h2></h2>
                        <h3>{loadingMessage}</h3>
                    </div>
            </div>
        }
    },

}

export default LoaderMixin
