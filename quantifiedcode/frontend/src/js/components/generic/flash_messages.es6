import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import FlashMessagesService from "flash_messages"
import $ from "jquery"
import {A} from "routing"

var FlashMessagesMixin = {

componentWillMount : function(){
  this.flashMessagesService = FlashMessagesService.getInstance()
  this.flashMessagesService.subscribe(this.updateStatus)
},

componentDidMount : function(){
  this.timerId = setInterval(function(){this.forceUpdate()}.bind(this),1000)
},

getInitialState : function(){
  return {messages : [] }
},

componentWillUnmount : function(){
  this.flashMessagesService.unsubscribe(this.updateStatus)
  clearInterval(this.timerId)
},

updateStatus : function(subject,property,value){
  if (subject === this.flashMessagesService){
    if (property === 'newMessage'){
      var newMessages = this.state.messages.slice(0)
      newMessages.push(value)
      this.setState({messages : newMessages})
      if (value.data.sticky)
        this.setState({viewed : false})
    }
  }
},
}
var createReactClass = require('create-react-class');

export let FlashMessagesMenu = createReactClass({

    displayName: 'FlashMessagesMenu',

    mixins : [FlashMessagesMixin],

    markAsViewed : function(){
      this.setState({viewed : true})
    },

    getInitialState : function(){
      return {viewed : false}
    },

    render : function(){
        var messageItems = this.state.messages.slice(-5).map(
        function(msg){
          var title = "Message"
          switch (msg.data.type){
            case "warning":
            title = "Warning";break
            case "error":
            case "danger":
            title = "Error";break
            case "info":
            title = "Info";break
          }
          if (msg.data.sticky === undefined){
            var elapsedTime = (new Date()).getTime() - msg.receivedAt.getTime()
            var prepareUnmount = false
            if (elapsedTime > msg.duration+4000)
              return undefined
            if (elapsedTime > msg.duration+1000){
              prepareUnmount = true
            }
          }
          if (msg.data.sticky) {
            if(msg.data.menu_url !== undefined)
              return <li><A href={msg.data.menu_url}><h4>{title}</h4>{msg.data.description}</A></li>
            else {
              return <li><h4>{title}</h4>{msg.data.description}</li>
            }
          }
        }.bind(this)
        )
      messageItems = messageItems.filter(function(item){ return item !== undefined;}).reverse()
      if (messageItems.length){
        var messageStatus = "fa-exclamation-triangle"
        if (this.state.viewed == true){
          messageStatus = "fa-exclamation-triangle"
        }
        return <li className="dropdown flash-messages-menu">
                  <A className="dropdown-toggle" data-toggle="dropdown" onClick={this.markAsViewed}>
                    <i className={"fa " + messageStatus} />
                  </A>
                  <ul className="dropdown-menu pull-right" role="menu" >
                    {messageItems}
                  </ul>
                 </li>
      } else {
        return null
      }
    }
})

var FlashMessageItem = createReactClass({

    displayName: 'FlashMessageItem',

    render : function() {

      return <div className="flash">
                <div className="container">
                  <div className="col-xs-12">
                    <div className="row">
                      <div className={"alert alert-"+(this.props.message.data.type !== undefined ? this.props.message.data.type : "info")+" clearfix"}>
                          <div className="col-md-10">
                            <div className="row">
                              <p key={this.props.message.id} className="space-bottom-0">
                                <A className="alert-link" onClick={this.fadeOut}>
                                  {this.props.message.data.description}
                                </A>
                              </p>
                            </div>
                          </div>
                          <div className="col-md-2">
                            <div className="row">
                              <A className="alert-link" onClick={this.fadeOut}>
                                    <i className="fa fa-times cross" />
                              </A>
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
    },

    componentDidMount : function(){
      try{
        var node = this.getDOMNode()
        $(node).hide()
        $(node).slideDown(400)
      }
      catch (e){

      }
    },

    componentWillReceiveProps : function(props){
      if (props.prepareUnmount && this.isMounted())
        this.fadeOut()
    },

    fadeOut : function(e){
      if (e !== undefined)
        e.preventDefault()
      if (! this.isMounted())
        return
      try{
        var node = this.getDOMNode()
        $(node).slideUp(400)
      }
      catch (e){
      }
    },

})


export let FlashMessagesHeader = createReactClass({

    displayName: 'FlashMessagesHeader',

    mixins : [FlashMessagesMixin],

    render : function(){
        var messageItems = this.state.messages.map(
        function(msg){
          var elapsedTime = (new Date()).getTime() - msg.receivedAt.getTime()
          var prepareUnmount = false
          if (elapsedTime > msg.duration+4000)
            return undefined
          if (elapsedTime > msg.duration+1000){
            prepareUnmount = true
          }
          return <FlashMessageItem key={msg.id} message={msg} prepareUnmount={prepareUnmount}/>
        }.bind(this)
        )
      messageItems = messageItems.filter(function(item){if (item !== undefined)return true;return false;})
      if (messageItems.length){
        return <div className="flash-messages">
        {messageItems}
        </div>
      }
      else{
        return <div />
      }
    }

})
