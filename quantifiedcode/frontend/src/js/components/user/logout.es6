import { render }  from 'react-dom';
import Utils from "utils"
import {redirectTo, makeUrl} from "routing"
import UserApi from "api/user"
import FormMixin from "components/mixins/form"
import FlashMessagesService from "flash_messages"
import React from "react"
var createReactClass = require('create-react-class');

var Logout = createReactClass({

    displayName: "Logout",

    componentWillMount : function(){
        this.flashMessagesService = FlashMessagesService.getInstance()
    },

    getInitialState :function(){
        return {loggedOut : false}
    },

    componentDidMount : function() {
        var confirmLogout = function() {
            Utils.logout()
            this.setState({loggedOut : true})
            redirectTo(makeUrl(this.props.baseUrl,{loggedOut : true}))
        }.bind(this)

        setTimeout(function(){
            UserApi.logout(confirmLogout, confirmLogout)
        }.bind(this),2000)
    },

    render: function () {
      if (this.state.loggedOut) {
        redirectTo(makeUrl("/"))
      } else {
        return <div className="row">
              <div className="col-xs-12">
              </div>
          </div>
      }
    },

})

export default Logout
