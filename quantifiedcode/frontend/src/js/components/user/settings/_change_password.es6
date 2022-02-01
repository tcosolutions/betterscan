import { render }  from 'react-dom';
import React from "react"
import UserApi from "api/user"
import FlashMessagesService from "flash_messages"
import FormMixin from "components/mixins/form"
import Utils from "utils"
var createReactClass = require('create-react-class');

var ChangePassword = createReactClass({
    displayName: 'ChangePassword',

    mixins: [FormMixin],

    fields: {
        password : {
            name: 'password',
            required: true,
            validator: function(value, name, data) {
                if (!value || value.length < 8)
                    throw {message: 'Password has to be at least 8 characters long.'}
            }
        },
        confirm_password: {
            name: 'password (for confirmation)',
            required: true,
            requiredMessage: 'Please confirm your new password.',
            validator: function(value, name, data){
                if (data.password !== value)
                    throw {message: 'The two passwords do not match.'}
            }
        },
        verify_password: {
            name: 'verify password',
            required: false,
        },
    },

    getInitialState: function () {
        return {
            confirm_password: '',
            password: '',
            verify_password: '',
        }
    },

    componentWillMount: function(){
        this.flashMessagesService = FlashMessagesService.getInstance()
    },

    componentDidMount: function() {
        Utils.trackEvent("Usage", "Change password form viewed")
    },

    render: function () {
        var state = this.state,
            user = this.props.user,
            verify

        if (user && user.has_password){
            verify = [
                <label htmlFor="password">Please enter your current password</label>,
                <input type="password"
                    onChange={this.setter('verify_password')}
                    value={state.verify_password}
                    id="verify_password"
                    className="form-control"
                    placeholder="" autofocus />,
                this.formatFieldError('verify_password'),
            ]
        }

        return <div className="content-box">
            <div className="head">
                <h3>Change password</h3>
            </div>
            <div className="body clearfix">
                <div className="row">
                    <div className="col-xs-12 clearfix">
                        <p className="form-info">Change your password. We recommend to change the password on a regular basis.</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12 col-sm-8 clearfix">
                        <form onSubmit={this.onSubmit} roleName="form">
                            <fieldset disabled={this.state.disabled}>
                            { this.formatErrorMessage() }
                            {verify}
                            <label htmlFor="password">New password</label>
                            <input type="password"
                                onChange={this.setter('password')}
                                value={state.password}
                                id="password"
                                className="form-control"
                                placeholder=""
                                autofocus />
                            {this.formatFieldError('password')}
                            <label htmlFor="password">Confirm new password</label>
                            <input type="password"
                                onChange={this.setter('confirm_password')}
                                value={state.confirm_password}
                                id="confirm_password"
                                className="form-control"
                                placeholder=""
                                autofocus />
                            {this.formatFieldError('confirm_password')}
                            <button className="btn btn-primary" type="submit">Update password</button>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        </div>

    },

    onSubmit: function (e) {

        e.preventDefault()

        var data = {
            password: this.state.password,
            confirm_password: this.state.confirm_password,
            verify_password: this.state.verify_password,
        }

        if (!this.validate(data))
            return

        var onSuccess = function(data){
            this.enable()
            this.flashMessagesService.postMessage({
                type: "info",
                description: "Your password was changed successfully.",
            })
            if (this.isMounted()) {
                this.setState({
                    confirm_password: '',
                    password: '',
                    verify_password: '',
                })
            }
        }.bind(this)

        var onError = function(xhr,status,e){
            this.enable()
            this.parseApiErrorData(xhr.responseJSON)
        }.bind(this)

        UserApi.changePassword(
            data,
            onSuccess,
            onError
        )

        this.disable()
    },
})

export default ChangePassword
