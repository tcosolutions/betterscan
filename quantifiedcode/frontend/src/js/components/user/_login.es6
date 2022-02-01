import { render }  from 'react-dom';
import Settings from "settings"
import Utils from "utils"
import {makeUrl, redirectTo, A} from "routing"
import UserApi from "api/user"
import FormMixin from "components/mixins/form"
import TabsMixin from "components/mixins/tabs"
import React from "react"
var createReactClass = require('create-react-class');

var EmailLoginComponent = createReactClass({

  mixins: [FormMixin],

  fields: {
    email: {
      required: true,
      requiredMessage: "Please enter an email.",
      validator: function(value, name, data) {
        var idx = value.indexOf('@')
        if (idx == -1)
          throw {message: "Please enter a valid email."}
        if (value.substr(idx+1).indexOf('.') == -1)
          throw {message: "Please enter a valid email."}
      }
    },
    password: {
      required: true,
      requiredMessage: "Please enter a password.",
      validator: function(value, name, data) {
        if (!value || value.length < 8)
          throw {message: "Password has to be at least 8 characters long."}
      }
    }
  },

  setPassword: function(e){
    this.setState({password : e.target.value})
  },

  setEmail: function(e){
    this.setState({email : e.target.value})
  },

  getInitialState: function () {
    return {
      email: '',
      password: ''
    }
  },

  render: function() {

    var props = this.props

    return (
      <form className="form"
            onSubmit={this.onSubmit}
            roleName="form">
        <fieldset>
          {this.formatErrorMessage()}
          <input type="email" onChange={this.setEmail} id="email" className="form-control" placeholder="Email" autofocus />
          {this.formatFieldError('email')}
          <input type="password" onChange={this.setPassword} password="password" className="form-control" placeholder="Password" />
          {this.formatFieldError('password')}
          <button id="login-button" className="btn btn-primary" type="submit"><span className="text">Log in</span></button>

          <div className="login-advice text-center">
            <A href={makeUrl("/user/password-reset-request", {}, props.params)}>Forgot password? </A>
            ⋅ <A href={makeUrl("/user/signup", {}, props.params)}>Sign up for free.</A>
          </div>
        </fieldset>
      </form>
    )
  },

  onSubmit: function (e) {
    e.preventDefault()

    var state = this.state,
      data = {
        email: state.email,
        password: state.password
      }

    if (!this.validate(data))
      return

    var onSuccess = function(data) {
      var user = data.user
      Utils.login(user)

      if (this.props.params.redirect_to)
        redirectTo(makeUrl(this.props.params.redirect_to))
      else
        redirectTo(makeUrl("/projects", {}))

    }.bind(this)

    var onError = function(xhr,status,e){
      this.parseApiErrorData(xhr.responseJSON)
      this.enable()
    }.bind(this)

    UserApi.login(data, onSuccess, onError)
    this.disable()
  }

})

var LoginComponent = createReactClass({

    displayName: "LoginComponent",

    mixins: [TabsMixin],



    processErrorCode : function(errorCode){
        return
        if (errorCode === undefined){
            this.clearErrorMessage()
            return
        }
        var message
        switch(errorCode){
            default: message = 'An error occurred, please try signing up again.';break
        }
        this.setErrorMessage(message)
    },

    componentDidMount : function(){
        this.processErrorCode(this.props.params.errorCode)
    },

    componentWillReceiveProps : function(nextProps){
        this.processErrorCode(nextProps.params.errorCode)
    },

    render: function () {
        var props = this.props


        var tabs = [
            {
                name : 'email',
                title : 'Email Login',
                href  :  makeUrl(props.baseUrl, {tab:'email'}, props.params),
                content : <EmailLoginComponent {...props} />
            }
        ]

        var newProjectProviders = Settings.providers['login'] || []

        newProjectProviders.forEach(function (provider) {
          tabs.push({
            name: provider.name,
            title : provider.title,
            href:  makeUrl(props.baseUrl, {tab: provider.name}, props.params),
            content : <provider.component {...props} />
          })
        })

        this.setupTabs(tabs, 'email')

        return  <div className="signup">
            {this.getTabs()}
            <hr />
            {this.getCurrentTabContent()}
        </div>

    }
})

export default LoginComponent
