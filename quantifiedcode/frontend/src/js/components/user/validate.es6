import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import {makeUrl, A} from "routing"
import UserApi from "api/user"
import FlashMessagesService from "flash_messages"
import FormMixin from "components/mixins/form"
import LoaderMixin from "components/mixins/loader"
import TabsMixin from "components/mixins/tabs"
var createReactClass = require('create-react-class');

var ValidateComponent = createReactClass({

    displayName: "ValidateComponent",

    mixins : [FormMixin,LoaderMixin],

    resources: function(props) {
        return [
            {
                name: 'validation',
                endpoint: this.apis.user.validateEmail,
                params : [props.data.email_auth_code]
            }
        ]
    },

    afterLoadingSuccess : function(data){

    },

    componentWillMount: function(newProps){
        this.flashMessagesService = FlashMessagesService.getInstance()
    },

    renderErrorPage : function(errorData){
        var errorMessage = <p>Response from server: <strong>{errorData.validation.responseJSON.message}</strong></p>
        return <div className="row">
            <div className="col-md-7 col-center text-center">
                <h2 className="text-center">Validation not successful</h2>
                <p>The validation was not successful, sorry.</p>
                {errorMessage}
            </div>
        </div>
    },

    render : function(){

        var button = <A className="btn btn-primary" href={makeUrl("/user/login")}>Log in</A>

        if (Utils.isLoggedIn())
            button = <A className="btn btn-primary" href={makeUrl("/projects")}>View your projects</A>

        return <div className="row">
                    <div className="col-md-7 col-center text-center">
                        <h2 className="text-center">Validation successful</h2>
                        <h3>Thanks for validating your email address!</h3>
                        <p>{button}</p>
                    </div>
                </div>
    }

})

export default ValidateComponent
