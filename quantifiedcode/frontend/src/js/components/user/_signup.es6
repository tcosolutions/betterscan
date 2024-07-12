import { render }  from 'react-dom';
import Settings from "settings"
import Utils from "utils"
import {redirectTo, makeUrl, A} from "routing"
import UserApi from "api/user"
import FormMixin from "components/mixins/form"
import TabsMixin from "components/mixins/tabs"
import React from "react"

var createReactClass = require('create-react-class');

var SignupComponent = createReactClass({

    displayName: "SignupComponent",

    mixins : [FormMixin,TabsMixin],

    fields: {
      name: {
        required: true,
        requiredMessage: "Please enter your login name.",
        validator: function(value, name, data) {
          if (value.length < 4) {
            throw {message: "Name has to be at least 4 characters long."}
          }
          if (value.length > 30) {
            throw {message: "Name can be at most 30 characters long."}
          }
          var regex = RegExp("^[\\w\\d-]{4,30}$")
          if(!regex.test(value)){
            throw {'message' : 'The login can only contain alphanumeric characters and "-" (no spaces or special characters). Example: Code-Coder.'}
          }
        },
      },
      password: {
        required: true,
        requiredMessage: "Please enter a password.",
        validator: function(value, name, data) {
          if (!value || value.length < 8)
            throw {message: "Password has to be at least 8 characters long."}
        },
      },
      passwordConfirm: {
        required: true,
        requiredMessage: "Please confirm your password.",
        validator: function(value, name, data) {
          if (data.password != value)
            throw {message: "Please confirm your password."}
        },
      },
      email: {
        required: true,
        requiredMessage: "Please enter an email.",
        validator: function(value, name, data) {
          var idx = value.indexOf('@')
          if (idx == -1)
            throw {message: "Please enter a valid email."}
          if (value.substr(idx+1).indexOf('.') == -1)
            throw {message: "Please enter a valid email."}
        },
      },
      terms: {
        required: false,
        requiredMessage: "You need to accept our Terms and Privacy Policy.",
        validator: function(value, name, data) {
          if (value !== true)
            throw {message: "You need to accept our Terms and Privacy Policy."}
        },
      },
    },

    setPassword: function(e){
      var value = e.target.value
      this.setState({password: value})
      if (value)
        this.clearFieldError('password')
    },

    setPasswordConfirm: function(e){
      var value = e.target.value
      this.setState({passwordConfirm: value})
      if (value == this.state.password)
        this.clearFieldError('passwordConfirm')
    },

    setEmail: function(e){
      var value = e.target.value
      this.setState({email: value})
      if (value) {
        var idx = value.indexOf('@')
        if (idx != -1 && value.substr(idx+1).indexOf('.') != -1)
          this.clearFieldError('email')
      }

    },

    setName: function(e){
      var value = e.target.value
      this.setState({name: value})
      if (value)
        this.clearFieldError('name')
    },

    setTerms: function(e){
      this.setState({terms: checked})
    },

    getInitialState: function () {
      return {
        email: '',
        errors: {},
        name: '',
        spacerWidth: false,
      }
    },

    componentDidMount: function(){
      Utils.trackEvent('Usage', 'Sign-up shown')
      this.processErrorCode(this.props.params.errorCode)
    },

    processErrorCode : function(errorCode){
      if (errorCode === undefined){
        this.clearErrorMessage()
        return
      }
      var message
      switch(errorCode){
        default:message = 'Did you signup first? You can login after a signup. If yes, than an Unknown exception has occured. Our staff has been notified.';break
      }
      this.setErrorMessage(message)
    },

    componentWillReceiveProps : function(nextProps){
      this.processErrorCode(nextProps.params.errorCode)
    },

    growSpacer: function() {
      this.setState({spacerWidth: !this.state.spacerWidth})
    },

    render: function () {

      var props = this.props
      var state = this.state

      var emailSignupForm = <form id="email_signup" className="form"
                                  onSubmit={this.onSubmit} roleName="form">
        {this.formatErrorMessage()}
        <input type="name"
               defaultValue={props.name}
               onChange={this.setName}
               id="name"
               className="form-control"
               placeholder="Choose a username (e.g., 'guido56')"
               autofocus />
        {this.formatFieldError('name')}
        <input type="email"
               defaultValue={props.email}
               onChange={this.setEmail}
               id="email"
               className="form-control"
               placeholder="Your email address" />
        {this.formatFieldError('email')}
        <input type="password"
               defaultValue={props.password}
               onChange={this.setPassword}
               password="password"
               className="no-margin form-control password"
               placeholder="Choose a password" />
        {this.formatFieldError('password')}
        <input type="password"
               defaultValue={props.password_verification}
               onChange={this.setPasswordConfirm}
               password="password"
               className="form-control password confirm"
               placeholder="Enter your password again" />
        {this.formatFieldError('passwordConfirm')}
        <hr />
        <button className="btn btn-primary"
                type="submit">
          <i className="fa fa-email fa-lg"></i><span className="text">Sign up for free.</span>
        </button>
      </form>

      var tabs = [
       {
          name : 'email',
          title : 'Email Signup',
          href  :  makeUrl(props.baseUrl, {tab: 'email'}, props.params),
          content : emailSignupForm
        }
      ]

      var newProjectProviders = Settings.providers['signup'] || []

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
        <p className="space-top-10 text-center trial">Already signed up? <A href={makeUrl('/user/login', this.props.params)}>Log in here.</A></p>
      </div>
    },

    onSubmit: function (e) {

      e.preventDefault()

      var state = this.state,
        props = this.props,
        data = {
          email: state.email,
          password: state.password,
          passwordConfirm: state.passwordConfirm,
          name: state.name,
          terms: state.terms,
        }


      if (!this.validate(data))
        return

      var onError = function(xhr,state,e){
        this.parseApiErrorData(xhr.responseJSON)
      }.bind(this)

      var redirectAfterSignup = function(data) {
        var source = 'Direct access'
        if (props.params.reanalyze !== undefined)
          source = 'Re-Analyzed'
        Utils.trackEvent('Conversion', 'Account created', source)

        Utils.login(data.user)
        if (this.props.params.redirect_to)
          redirectTo(makeUrl(this.props.params.redirect_to))
        else
          redirectTo(makeUrl(
            "/projects",
            this.props.params
          ))
      }.bind(this)

      this.clearAllErrors()
      UserApi.signup(
        data,
        redirectAfterSignup,
        onError)
    },

})

export default SignupComponent
