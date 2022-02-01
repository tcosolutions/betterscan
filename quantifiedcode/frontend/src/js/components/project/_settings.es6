import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import {makeUrl, A} from "routing"
import TabsMixin from "components/mixins/tabs"
import LoaderMixin from "components/mixins/loader"
import Sidebar from "components/generic/sidebar"
import Icon from "components/generic/icon"
import Analysis from "./settings/_analysis"
import AccessManagement from "./settings/_access_management"
import Badges from "./settings/_badges"
import DangerZone from "./settings/_danger_zone"
import Hooks from "./settings/_hooks"
import IssueClasses from "./settings/_issue_classes"
import Basics from "./settings/_basics"
import Settings from "settings"


var createReactClass = require('create-react-class');

var ProjectSettings = createReactClass({

    displayName: 'ProjectSettings',

    mixins: [TabsMixin, LoaderMixin],

    getInitialState: function(){
        return {
            remotes: [],
            openRemotes: [],
            project: undefined,
            deleting: false,
        }
    },

    resources: function(props) {
        return [
            {
                name: 'project',
                endpoint: this.apis.project.getDetails,
                params: [props.data.projectId, {}],
                mapping: {project: 'project'},
                nonBlocking: false
            },
        ]
    },

    componentDidMount : function() {
        Utils.trackEvent("Usage", "Project settings viewed")
    },

    render: function(){
        var data = this.state.data

        var tabs = []

        if (["admin","owner"].some(role => data.project.user_role == role)){
            tabs.push({
                name : 'basics',
                title : 'Basics',
                href  :  makeUrl(this.props.baseUrl,
                                       {tab:'basics'}),
                content : <Basics project={data.project}
                                  data={this.props.data}
                                  onChange={this.reloadResources}
                                  baseUrl={this.props.baseUrl}
                                  params={this.props.params} />
            })
        }

        tabs.push({
                name: 'badges',
                title: 'Badges',
                href:  makeUrl(this.props.baseUrl,
                                       {tab:'badges'},this.props.params),
                content: <Badges
                            project={data.project}
                            onChange={this.reloadResources}
                            baseUrl={this.props.baseUrl} />,
        })


        var reloadResources = this.reloadResources
        var props = this.props
        var providers = Settings.providers['project.settings'] || []



        providers
          .filter(function(provider) {
            return provider.component.isApplicable(data.project)
          })
          .forEach(function (provider) {
            tabs.push({
              name : provider.name,
              title : [provider.title + " ", <Icon name={provider.icon} />],
              href : makeUrl(props.baseUrl,{tab : provider.name}),
              content : <provider.component project={data.project}
                                            onChange={reloadResources}
                                            baseUrl={props.baseUrl} />
            })
          })

        var defaultTab = 'badges'

        if (["admin","owner"].some(role => data.project.user_role == role) ){

            defaultTab = 'basics'

            tabs.push(
            {
                name : 'analysis',
                title : 'Issue Classes',
                href  :  makeUrl(this.props.baseUrl,
                                       {tab:'analysis'}),
                content : <IssueClasses project={data.project}
                                        data={this.props.data}
                                        baseUrl={this.props.baseUrl} params={this.props.params} />
            },
            {
                name: 'hooks',
                title: 'Hooks',
                href:  makeUrl(this.props.baseUrl,
                                       {tab:'hooks'},this.props.params),
                content: <Hooks
                            project={data.project}
                            onChange={this.reloadResources}
                            baseUrl={this.props.baseUrl} />,
            })
        }

        if (data.project.user_role == 'owner'){
            tabs.push(
            {
                name: 'am',
                title: 'Access management',
                href:  makeUrl(this.props.baseUrl,
                                       {tab:'am'}),
                content: <AccessManagement
                            project={data.project}
                            onChange={this.reloadResources}
                            baseUrl={this.props.baseUrl}
                            params={this.props.params} />,
            },
            {
                name : 'danger',
                title : 'Danger zone',
                href  :  makeUrl(this.props.baseUrl,
                                       {tab:'danger'}),
                content : <DangerZone onChange={this.reloadResources}
                                      project={data.project}
                                      data={this.props.data}/>
            })
        }

        this.setupTabs(tabs, defaultTab)

        var sidebarContent = <div className="box tab-box default">
            <div className="head">
                <h4 className="settings-header">Project settings</h4>
            </div>
            <div className="body clearfix">
                {this.getTabs()}
            </div>
        </div>

        return <div className="row">
                    <div className="col-xs-12 col-sm-3">
                        <Sidebar>
                            {sidebarContent}
                        </Sidebar>
                    </div>
                    <div className="col-xs-12 col-sm-9">
                        {this.getCurrentTabContent()}
                    </div>
                </div>
    }
})

export default ProjectSettings
