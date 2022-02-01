import React from "react"
import ReactDOM from 'react-dom';
import Utils from "utils"
import {makeUrl, redirectTo} from "routing"
import Settings from "settings"
import Menu from "components/menu"
import Header from "components/header"
import LoaderMixin from "components/mixins/loader"
import Modal from "components/generic/modal"
import $ from "jquery"

var createReactClass = require('create-react-class');

var MainApp = createReactClass({
    displayName: 'MainApp',

    mixins: [LoaderMixin],

    resources : function(props){
        var r = [{
                name: 'settings',
                endpoint: this.apis.admin.getSettings,
                params: [],
                alwaysReload : true,
                mapping : {settings : 'settings'}
            }]
        if (Utils.isLoggedIn())
            r.push(
                {
                    name : 'user',
                    endpoint : this.apis.user.getUser,
                    params: [{}],
                    mapping: {user: 'user'},
                    error: function(xhr){if(Utils.isLoggedIn()){this.apis.user.logout();}}
                }
            )
        return r
    },

    getDefaultProps : function (){
        return {
            data: {},
        }
    },

    afterLoadingSuccess: function(d){
        if (d.settings)
            $.extend(Settings,d.settings)
        d.hasBeenUpdated = this.state.data && this.state.data.settings && this.state.data.settings.version !== d.settings.version

        var user = d.user
        if(user) {
            Utils.login(user)
        }

        return d
    },

    reloadPage: function() {
        location.reload()
        this.setState({reloading: true})
    },

    render: function () {
        var Component = this.props.component

        var modal
        if (this.state.data.hasBeenUpdated) {
            modal = <Modal
                key="updatedModal"
                confirm={<span>{this.state.reloading ? React.DOM.i({className:"fa fa-refresh fa-spin"},'') : React.DOM.i({className:"fa fa-refresh"},'')} Reload </span>}
                disabled={false}
                onConfirm={this.reloadPage}
                cancel="Not now"
                hidden={false}
                closable={false}
                title={['Scanner has been updated!']}>
                  <p>There is a new version of Scanner.<br/>Please reload this page to enjoy the new release.</p>
              </Modal>
        }

        try {
            return <div>
                    {modal}
                    <Component
                        app={this}
                        baseUrl={this.props.baseUrl}
                        data={this.props.data}
                        params={this.props.params} />
                </div>
        } catch(e) {
            return <div>
                    {modal}
                    <h3>An error occured</h3>
                    <p>Sorry, there was a problem rendering this page.</p>
                </div>
        }
    }
})


// this container is seperated from the MainApp because MainApp uses the loader mixin and might
// therefore be replaced by a spinner or an error message. But we want this part of the app
// (header and <div class="container"></div>) to be always visible.
var AppContainer = createReactClass({
    displayName: "AppContainer",

    componentDidMount: function() {
        this.componentDidUpdate()

        //patch the brand logo in order to avoid page refreshes when clicked
        var logo = document.querySelector("#nav-head .navbar-brand")
        logo.addEventListener("click", function(e) {
          if (Utils.isLoggedIn()) {
            redirectTo(makeUrl("/"))
            e.preventDefault()
          }
        })
    },

    componentDidUpdate: function() {
        var menu = <Menu params={this.props.params}
                         data={this.props.data}
                         baseUrl={this.props.baseUrl}
                         app={this}/>

        //call React.render outside of the render function below.
        //Calling it from within the render function is not supported by React
        //and might break in a future version.
        ReactDOM.render(menu,
            document.getElementById('menu')
        )
    },

    render: function () {
        var header = <Header params={this.props.params}
                             data={this.props.data}
                             baseUrl={this.props.baseUrl}
                             app={this}/>

        return <div>
            {header}
            <div className="container">
                <MainApp {...this.props} />
            </div>
          </div>
  }
})


export default AppContainer
