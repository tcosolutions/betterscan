import { render }  from 'react-dom';
import React from "react"
import TabsMixin from "components/mixins/tabs"
import SnapshotIssues from "components/snapshot/_issues"
import DiffIssues from "components/diff/_issues"
import TaskList from "components/task/_list"
import TaskDetails from "components/task/_details"
import FileViewer from "components/file_revision/_file_viewer"
import ProjectHeader from "components/project/_header"
import ProjectSettings from "components/project/_settings"
import LoaderMixin from "components/mixins/loader"
import Icon from "components/generic/icon"
import {makeUrl, setTitle, setMetaTag} from "routing"
import Settings from "settings"
import FlashMessagesService from "flash_messages"
var createReactClass = require('create-react-class');

var ProjectDetails = createReactClass({

    displayName: 'ProjectDetails',

    mixins : [TabsMixin,LoaderMixin],

    resources : function(props){
        return [
            {
                name : 'project',
                endpoint : this.apis.project.getDetails,
                params : [
                    props.data.projectId,
                    {with_branches: true},
                ],
            }
        ]
    },

    componentWillMount : function(){
        this.flashMessagesService = FlashMessagesService.getInstance()
    },

    getDefaultProps : function(){
        return {}
    },

    tabName : function(){
        if (this.props.data.tab)
            return this.props.data.tab
    },

    afterLoadingSuccess : function(data){
        // Check if we got tags and join tags (without 'generic')
        var tags = data.project.tags || []
        var keywords = tags.filter(function(t) {return t != "generic"})

        var branch = this.props.params.branch
        var title = data.project.name + (branch ? " ("+branch+"branch)" : "") +  " - Code quality"

        setTitle(title)
        setMetaTag("keywords", keywords.join(","))

        return data
    },


    render : function(){
        var data = this.state.data

        var projectHeader
        var projectName

        var issuesContent
        if (this.props.data.snapshotAId && this.props.data.snapshotBId) {
            issuesContent = <DiffIssues
                        project={data.project}
                        baseUrl={this.props.baseUrl}
                        data={this.props.data}
                        params={this.props.params} />
        } else {
            issuesContent = <SnapshotIssues
                            project={data.project}
                            baseUrl={this.props.baseUrl}
                            data={this.props.data}
                            params={this.props.params} />
        }

        var tasksContent
        if (this.props.data.taskId) {
            tasksContent = <TaskDetails
                        baseUrl={this.props.baseUrl}
                        params={this.props.params}
                        data={this.props.data}
                        project={data.project} />
        } else {
            tasksContent = <TaskList
                        baseUrl={this.props.baseUrl}
                        params={this.props.params}
                        data={this.props.data}
                        project={data.project} />
        }

        var tabs = [
            {
                name : 'issues',
                title : <span><Icon name="git-commit" /><span className="hidden-xs"> Issues</span></span>,
                href :  makeUrl('/project/'+this.props.data.projectId+'/snapshot', {}, {}),
                content : issuesContent
            }
        ]


        var props = this.props
        var providers = Settings.providers['project.details'] || []

        providers
          .filter(function(provider) {
            return provider.component.isApplicable(data.project)
          })
          .forEach(function (provider) {
            tabs.push({
              name: provider.name,
              title : [<Icon name={provider.icon} />, <span className="hidden-xs"> {provider.title}</span>],
              href:  makeUrl('/project/' + props.data.projectId + '/' + provider.name, {}, {}),
              content : <provider.component project={data.project} {...props}/>
            })
        })
        if (["admin","owner"].some(role => data.project.user_role == role)){
            tabs.push({
                    name : 'tasks',
                    title : <span><Icon name="checklist" /><span className="hidden-xs"> Log</span></span>,
                    href :  makeUrl('/project/'+this.props.data.projectId+'/tasks', {}, {}),
                    activeHref :  makeUrl('/project/'+this.props.data.projectId+'/tasks', {}, {}),
                    content : tasksContent
                })
        }

        tabs.push({
                name: 'settings',
                title: <span><Icon name="gear" /><span className="hidden-xs"> Settings</span></span>,
                href:  makeUrl('/project/'+data.project.pk+'/settings', {}, {}),
                content: <ProjectSettings
                    baseUrl={this.props.baseUrl}
                    params={this.props.params}
                    data={this.props.data} />
            })

        //The file tab is only visible if it is selected since
        //we currently do not have a file browser
        if(this.tabName() == 'snapshotFile') {
            tabs.push({
                    name : 'snapshotFile',
                    title : [<Icon name="file-directory" />,<span className="hidden-xs"> File</span>],
                    href :  makeUrl('/project/'+this.props.data.projectId+'/file_revision/' + this.props.data.fileRevisionId, {}, {}),
                    content : <FileViewer
                        baseUrl={this.props.baseUrl}
                        params={this.props.params}
                        data={this.props.data} />
            })
        }


        this.setupTabs(tabs, 'issues')

        projectHeader = <ProjectHeader data={this.props.data}
                                       baseUrl={this.props.baseUrl}
                                       params={this.props.params}
                                       project={data.project}
                                       tabs={this.getTabs()}
                                       onChange={this.reloadResources}/>

        return <div className="project-details" data-project-name={data.project.name}>
                <div className="row">
                    <div className="col-md-12">
                        {projectHeader}
                        {this.getCurrentTabContent()}
                    </div>
                </div>
            </div>

    },

})

export default ProjectDetails
