import { render }  from 'react-dom';
import {makeUrl} from "routing"
import UserApi from "api/user"
import FormMixin from "components/mixins/form"
import TabsMixin from "components/mixins/tabs"
import FlashMessagesService from "flash_messages"
import React from "react"
var createReactClass = require('create-react-class');

var PasswordResetRequest = createReactClass({

    mixins : [FormMixin,TabsMixin],

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
            },
        },
    },

    setEmail: function(e){
        this.setState({email : e.target.value})
    },

    getInitialState: function () {
        return {email : ''}
    },

    componentWillMount : function(){
        this.flashMessagesService = FlashMessagesService.getInstance()
    },

    render: function () {
        if (this.state.success !== undefined){
            if (this.state.success)
                return <div className="row">
                    <div className="col-xs-10 col-md-6 col-center">
                        <h3>Thanks! We have sent you an email with further instructions, please check your inbox.</h3>
                    </div>
                </div>
            else
                return <div className="row">
                            <div className="col-xs-10 col-md-6 col-center">
                                <h3>An error occured.</h3>
                                <p>Please make sure that the email address you entered is valid.</p>
                            </div>
                        </div>
        }


        var passwordRequestForm = <div className="row">
                        <form className="form"onSubmit={this.onSubmit} roleName="form">
                            {this.formatErrorMessage()}
                            <input type="email" onChange={this.setEmail} id="email" className="form-control" placeholder="Email address" autofocus />
                            {this.formatFieldError('email')}
                            <button className="btn btn-primary" type="submit">Request password</button>
                        </form>
                </div>

        var tabs = [
            {
                name : 'password_request',
                title : 'Request password',
                href  :  makeUrl(this.props.baseUrl,
                                       {tab:'password_request'},
                                       this.props.params),
                content : passwordRequestForm
            },
        ]

        this.setupTabs(tabs, 'password_request')

        return  <div className="row">
                    <div className="col-xs-10 col-sm-6 col-md-4 col-lg-4 col-center">
                        <div className="signup">
                            {this.getTabs()}
                            <hr />
                            {this.getCurrentTabContent()}
                        </div>
                    </div>
                </div>
    },

    onSubmit: function (e) {
        e.preventDefault()
        var data = {email : this.state.email.trim()}
        if (!this.validate(data))
            return

        var onSuccess = function(data){
            this.setState({success : true})
        }.bind(this)

        var onError = function(xhr,status,e){
            this.setState({sucess : false})
            this.parseApiErrorData(xhr.responseJSON)
        }.bind(this)

        UserApi.requestPasswordReset(data,onSuccess,onError)
    },

})

export default PasswordResetRequest
