import { render }  from 'react-dom';
import {makeUrl, redirectTo, A} from "routing"
import UserApi from "api/user"
import FormMixin from "components/mixins/form"
import FlashMessagesService from "flash_messages"
import React from "react"
var createReactClass = require('create-react-class');

var PasswordReset =createReactClass({

    displayName: "PasswordReset",

    mixins : [FormMixin],

    fields: {
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
                    throw {message: "The two passwords do not match."}
            },
        }
    },

    getInitialState: function () {
        return {password : '', confirmPassword : ''}
    },

    componentWillMount : function(){
        this.flashMessagesService = FlashMessagesService.getInstance()
    },

    componentDidMount : function() {
        if (!this.props.params.reset_code) {
            redirectTo(makeUrl("/user/login",{},{}))
        }
    },

    render: function () {
        if (this.state.success !== undefined){
            if (this.state.success)
                return <div className="row">
                    <div className="col-md-6 col-md-offset-3">
                        <h2 className="text-center">Success</h2>
                        <p>Your password has been changed.</p>
                        <A href={makeUrl('/user/login')}
                           className="btn btn-primary">Log in</A>
                    </div>
                </div>
            else
                return <div className="row">
                    <div className="col-md-6 col-md-offset-3">
                        <h2 className="text-center">An error occured</h2>
                        <p>An error occured, please try requesting another password reset token.</p>
                        <A href={makeUrl('/user/password-reset-request')}
                           className="btn btn-primary">Request password reset</A>
                    </div>
                </div>
        }
        return <div className="row">
                    <div className="col-xs-12">
                        <h2 className="text-center">Reset your Password</h2>
                    </div>
                    <div className="col-xs-4 col-center clearfix">
                        <form onSubmit={this.handleSubmit} roleName="form">
                            {this.formatErrorMessage()}
                            <input type="password"
                                   onChange={this.setter('password')}
                                   id="password"
                                   className="form-control"
                                   placeholder="Enter a new password"
                                   autofocus/>
                            {this.formatFieldError('password')}
                            <input type="password"
                                   onChange={this.setter('passwordConfirm')}
                                   id="passwordConfirm"
                                   className="form-control"
                                   placeholder="Confirm the password"
                                   autofocus />
                            {this.formatFieldError('passwordConfirm')}
                            <button className="btn btn-primary"
                                    type="submit">Update Password</button>
                        </form>
                    </div>
                </div>
    },

    handleSubmit: function (e) {

        e.preventDefault()

        var data = {password : this.state.password,passwordConfirm : this.state.passwordConfirm}

        if (!this.validate(data))
            return

        var onSuccess = function(data){
            this.setState({success : true})
            this.flashMessagesService.postMessage({type : "info",
               description : "Your Password has been successfully reset."})
        }.bind(this)

        var onError = function(xhr,status,e){
            this.setState({success : false})
            this.parseApiErrorData(xhr.responseJSON)
        }.bind(this)

        UserApi.resetPassword(data,this.props.params.reset_code,onSuccess,onError)
    },

})

export default PasswordReset
