import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import UserApi from "api/user"
import Modal from "components/generic/modal"
import RequestNotifier from "request_notifier"
import {FlashMessagesHeader} from "components/generic/flash_messages"
import {makeUrl, redirectTo, A} from "routing"
var createReactClass = require('create-react-class');
var RequestIndicator = createReactClass({

    displayName: 'RequestIndicator',

    getInitialState : function(){
        return {hidden : false}
    },

    hideMessage : function(e){
        this.setState({hidden : true})
        e.preventDefault()
    },

    componentWillReceiveProps : function(props){
        if (props.activeRequestCount !== undefined && props.activeRequestCount == 0)
            this.setState({hidden : false})
    },

    render : function(){
        if (this.state.hidden)
            return
        if (this.props.connectionError == true){
            return <p className="request-indicator"><A onClick={this.hideMessage}><span className="fa fa-exclamation-triangle" />Connection problem!</A></p>
        } else {
            //always display at least 2 point and at most 4 points
            //displaying a 1 point is a bad idea since this will be interpreted
            //as the terminator of the sentence and not as a loading indicator
            var dotsCnt = Math.min(3, this.props.activeRequestCount)
            var dots = "."
            for (var i = 0; i < dotsCnt; i++)
                dots += "."
            return <p></p> 
        }
    }
})

var Header = createReactClass({

    displayName: 'Header',

    componentWillMount : function(){
        this.requestNotifier = RequestNotifier.getInstance()
        Utils.addRequestNotifier(this.requestNotifier)
        this.requestNotifier.subscribe(this.updateStatus)
        this.rendering = false
        this.events = []
    },

    getInitialState : function(){
        return {activeRequestCount : 0}
    },

    componentDidMount : function(){
        this.setState({activeRequestCount : this.requestNotifier.activeRequestCount()})
    },

    componentWillUnmount : function(){
        this.requestNotifier.unsubscribe(this.updateStatus)
    },

    componentWillUpdate : function(){
        this.rendering = true
    },

    componentDidUpdate : function(){
        this.rendering = false
        if (this.events.length){
            return
            for(var i in this.events){
                this.updateStatus(...this.events[i])
            }
            this.events = []
        }
    },

    updateStatus : function(subject,property,value){
        if (!this.isMounted())
            return
        if (this.rendering)
            return this.events.push([subject,property,value])

        if (subject === this.requestNotifier){
            if (property == 'connectionError'){
                this.setState({connectionError : true,
                        willRetryIn : value.requestData.data.retryInterval || 1})
            }
            else if (property === 'activeRequestCount'){
                setTimeout(function(count){
                    if (!this.isMounted())
                        return
                    if (this.requestNotifier.activeRequestCount() == count)
                        this.setState({activeRequestCount :count})
                }.bind(this,value),20)
            }
            else if (property == 'requestFailed'){
                if (value.xhr.status == 401){
                    this.setState({userHasBeenLoggedOut : true})
                    Utils.logout()
                    this.forceUpdate()
                } else if (value.xhr.status == 503){
                    this.setState({serviceUnavailable : true})
                }
            }
        }
    },

    componentWillReceiveProps : function(props){
        this.setState({connectionError : false,
                       userHasBeenLoggedOut : false,
                       serviceUnavailable : false})
    },

    render: function () {
        var flashMessagesHeader = <FlashMessagesHeader baseUrl={this.props.baseUrl} params={this.props.params} />

        var requestIndicator = undefined
        var modal
        if (this.state.connectionError){
            var retry = function(e){
                e.preventDefault()
                this.setState({connectionError: false})
                location.reload()
            }.bind(this)

            modal = <Modal
                ref="connectionProblemModal"
                confirm={[<i className="fa fa-refresh" />," Reload ",this.state.retrying ? React.DOM.i({className:"fa fa-refresh fa-spin"},'') : undefined]}
                disabled={this.state.retrying}
                onConfirm={retry}
                hidden={false}
                cancel="Not now"
                title={[<i className="fa fa-exclamation-triangle" />,'Connection problem']}>
                    <p>There was a problem connecting to www..com...<br />Please try reloading the page.</p>
              </Modal>
        }
        else if (this.state.serviceUnavailable){
            var retry = function(e){
                e.preventDefault()
                this.setState({serviceUnavailable: false})
                location.reload()
            }.bind(this)

            modal = <Modal
                ref="serviceUnavailableModal"
                confirm={[<i className="fa fa-refresh" />," Reload ",this.state.retrying ? React.DOM.i({className:"fa fa-refresh fa-spin"},'') : undefined]}
                disabled={this.state.retrying}
                onConfirm={retry}
                hidden={false}
                cancel="Not now"
                title={[<i className="fa fa-exclamation-triangle" />,'Temporary maintenance']}>
                    <p>Scanner is currently down for maintenance, please try again later. Sorry for the inconvenience!</p>
              </Modal>
        }
        else if (this.state.userHasBeenLoggedOut){
            var login = function(e){
                e.preventDefault()
                redirectTo(makeUrl("/user/login",{redirect_to : this.props.baseUrl}))
                this.setState({redirecting : true, userHasBeenLoggedOut : false})
            }.bind(this)

            modal = <Modal
                ref="loggedOutModal"
                confirm={[<i className="fa fa-sign-in" />," Login / Sign Up ",this.state.redirecting ? React.DOM.i({className:"fa fa-refresh fa-spin"},'') : undefined]}
                onConfirm={login}
                closable={false}
                hidden={false}
                title={[<i className="fa fa-exclamation-triangle" />,' You need to be logged in']}>
                    <p>It seems that you have been logged out or that your session has expired. The page or action you requested requíres you to be logged in though.</p>
              </Modal>
        }

        if (this.state.activeRequestCount > 0 || this.state.connectionError)
            requestIndicator = <RequestIndicator willRetryIn={this.state.willRetryIn} connectionError={this.state.connectionError} activeRequestCount={this.state.activeRequestCount} baseUrl={this.props.baseUrl} params={this.props.params} data={this.props.data} />

        return <div className="header">
            {modal}
            {flashMessagesHeader}
            {requestIndicator}
        </div>
    }
})

export default Header
