import { render }  from 'react-dom';
import Utils from "utils"
import {redirectTo, makeUrl} from "routing"
import FormMixin from "components/mixins/form"
import TabsMixin from "components/mixins/tabs"
import LoginComponent from "components/user/_login"
import SignupComponent from "components/user/_signup"
import FlashMessagesService from "flash_messages"
import React from "react"
var createReactClass = require('create-react-class');

var LoginSignup = createReactClass({

    displayName: 'LoginSignup',

    mixins: [FormMixin],

    getInitialState : function (){
        return {}
    },

    componentDidMount: function() {
        if(Utils.isLoggedIn()) {
            redirectTo(makeUrl(this.props.params.redirect_to || "/"))
        }
    },

    render: function() {

        var props = this.props,
            state = this.state,
            signUpInfoBox = ''

        if (state.signUpInfoMessage !== undefined)
            signUpInfoBox = <div className="col-xs-7 col-center">
                                <div className="alert">{state.signUpInfoMessage}</div>
                            </div>

        var tab = 'login'
        var tabContent = <LoginComponent
            app={props.app}
            baseUrl={props.baseUrl}
            params={props.params} />
        if (props.data.action){
            switch(props.data.action){
                case 'signup':
                    tab = 'signup'
                    tabContent = <SignupComponent app={props.app} baseUrl={props.baseUrl} params={props.params} />
                    break
            }
        }

        var backButton
        if (tab != 'login')
            backButton = React.DOM.a({className:"pull-right btn btn-primary",href: props.baseUrl+"/login"},'< Back')

        var slogan
        if (this.props.params.referer){
            switch(this.props.params.referer){
                case 'pattern':slogan = "Sign up for free or log in to add a code checks to your projects.";break
                case 'issue':slogan = "Sign up for free or log in to view issue details.";break
                case 'commit':slogan = "Sign up for free or log in to view commit details.";break
                default:slogan = "Sign up for free or log in to perform this action.";break
            }
        }

        if (slogan)
            slogan = React.DOM.div({className: "alert alert-warning"}, [React.DOM.h3(null, [slogan])])


        return <div className="row">
                    <div className="col-xs-10 col-sm-6 col-md-4 col-lg-4 col-center">
                        {slogan}
                        <div className="signin">
                            {signUpInfoBox}
                            {tabContent}
                        </div>
                    </div>
                </div>
    }

})

export default LoginSignup
