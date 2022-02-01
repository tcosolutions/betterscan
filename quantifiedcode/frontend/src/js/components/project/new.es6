import { render }  from 'react-dom';
import React from "react"
import ProjectApi from "api/project"
import FormMixin from "components/mixins/form"
import LoaderMixin from "components/mixins/loader"
import TabsMixin from "components/mixins/tabs"
import Paginator from "components/generic/paginator"
import ToggleSwitch from "components/generic/toggle_switch"
import FlashMessagesService from "flash_messages"
import {makeUrl} from "routing"
import Settings from "settings"


var createReactClass = require('create-react-class');
var NewProject = createReactClass({

    displayName: 'NewProject',

    mixins: [FormMixin, TabsMixin, LoaderMixin],

    resources: function(props){
        var resources = [
            {
                name: 'user',
                endpoint: this.apis.user.getUser,
                params: [{}],
                mapping: {
                    user: 'user',
                }
            }
        ]
        return resources
    },

    render: function() {

        var props = this.props,
            data = this.state.data

        var tabs = []

        var defaultMethod

        var newProjectProviders = Settings.providers['project.new'] || []
        for(var i=0;i < newProjectProviders.length; i++){
          var newProjectProvider = newProjectProviders[i]
          if (defaultMethod == undefined || newProjectProvider.setAsDefault)
            defaultMethod = newProjectProvider.name
          tabs.push({
            name: newProjectProvider.name,
            title : newProjectProvider.title,
            href:  makeUrl(
                props.baseUrl,
                {tab: newProjectProvider.name},
                props.params
            ),
            content : <newProjectProvider.component
                        baseUrl={props.baseUrl}
                        params={props.params}
                        user={data.user} />
          })
        }

        this.setupTabs(tabs, defaultMethod, "nav nav-tabs")

        return <div id="new-project">
                <div className="row">
                    <div className="col-xs-12 col-sm-9 col-center">
                        <h1 className="headline">Add new project</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12 col-sm-9 col-center">
                        <div className="content-box">
                            <div className="body clearfix">
                                <div className="row">
                                    <div className="col-xs-12 space-bottom-20">
                                        {this.getTabs()}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-12">
                                        {this.getCurrentTabContent()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    }
})

export default NewProject
