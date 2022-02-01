import { render }  from 'react-dom';
import React from "react"
import UserApi from "api/user"
import FlashMessagesService from "flash_messages"
import FormMixin from "components/mixins/form"
import Utils from "utils"
var createReactClass = require('create-react-class');

var ChangeEmail = createReactClass({
    displayName: 'ChangeEmail',

    mixins : [FormMixin],

    fields: {
        email: {
            name: 'email',
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
        check_password: {
            name: 'password',
            required: false,
            validator: function(value, name, data) {
                if (this.props.user.password_set && !value) {
                    throw {message: 'Password is required.'}
                }
            },
        },
    },

    getInitialState: function () {
        var user = this.props.user || {}
        return {
            email: '',
            verify_password: '',
            user: {
                email: user.email,
                password_set : user.password_set || false},
        }
    },

    componentWillMount : function(){
        this.flashMessagesService = FlashMessagesService.getInstance()
    },

    componentDidMount : function() {
        Utils.trackEvent("Usage", "Change email form viewed")
    },

    render: function () {
        var state = this.state,
            props = this.props,
            verify

        if (state.user.password_set) {
            verify = [<label htmlFor="password">Please enter your current password</label>,
                <input type="password"
                    onChange={this.setter('verify_password')}
                    value={state.verify_password}
                    id="verifyPassword"
                    className="form-control"
                    placeholder=""
                    autofocus />,
                this.formatFieldError('verify_password'),
                <button className="btn btn-primary" type="submit">Update email</button>
            ]
        }
        else {
            verify = [<button className="btn btn-primary" type="submit">Update email</button>]
        }

        var changeEmailMessage

        if (props.user.new_email)
            changeEmailMessage = <p className="alert alert-info">Pending change request to {props.user.new_email} (awaiting confirmation).</p>

        return  <div className="content-box">
            <div className="head">
                <h3>Change email</h3>
            </div>
            <div className="body clearfix">
                {changeEmailMessage}
                <form onSubmit={this.onSubmit} roleName="form">
                    <fieldset disabled={this.state.disabled}>
                    { this.formatErrorMessage() }
                    <label htmlFor="currentemail">Your current email</label>
                    <p className="alert" id="currentemail">{state.user.email}</p>
                    <label htmlFor="email">New email</label>
                    <input type="email"
                        onChange={this.setter('email')}
                        value={state.email}
                        id="email"
                        className="form-control"
                        placeholder="Email"
                        autofocus />
                    {this.formatFieldError('email')}
                    {verify}
                    </fieldset>
                </form>
            </div>
        </div>
    },

    onSubmit : function (e) {
        e.preventDefault()
        var data = {
            email: this.state.email.trim()
        }

        if (!this.validate(data))
            return

        var onSuccess = function(data){
            this.enable()
            this.props.onChange()
        }.bind(this)

        var onError = function(xhr,status,e){
            this.enable()
            this.parseApiErrorData(xhr.responseJSON)
        }.bind(this)

        UserApi.updateUser(
            data,
            onSuccess,
            onError
        )
        this.disable()
    },
})

export default ChangeEmail
