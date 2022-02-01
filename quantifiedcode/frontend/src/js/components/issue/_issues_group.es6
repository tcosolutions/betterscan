import { render }  from 'react-dom';
import React from "react"
import IssueClassApi from "api/issue_class"
import IssueLabels from "components/issue/_issue_labels"
import IssuesGroupList from "components/issue/_issues_group_list"
import IssuesGroupSummary from "components/issue/_issues_group_summary"
import IssueHelpers from "helpers/issue"
import Utils from "utils"
import {makeUrl, A} from "routing"
import FlashMessagesService from "flash_messages"
import Settings from "settings"
import $ from "jquery"
var createReactClass = require('create-react-class');

var IssuesGroup = createReactClass({

    displayName: 'IssuesGroup',

    componentWillMount : function(){
        this.flashMessagesService = FlashMessagesService.getInstance()
    },

    removeIssueClassFromProject : function() {

        var onError = function(xhr) {
            var reportIssueLink = <A href="https://github.com//issues/issues/new" target="_blank">report an issue</A>
            var description = <span>Code check couldn&#39;t be disabled. Please try again or {reportIssueLink}.</span>

            this.flashMessagesService.postMessage({
                type : "danger",
                description : description
            })
        }.bind(this)

        var onSuccess = function () {
            var settingsLink = <A href={makeUrl("/project/" + this.props.project.pk + "/settings?tab=analysis&type=disabled")}>project&#39;s settings</A>
            var description = <span>Code check disabled. To re-enable it, go to your {settingsLink}.</span>

            this.flashMessagesService.postMessage({
                type : "info",
                description : description
            })
        }.bind(this)

        IssueClassApi.removeIssueClassFromProject(
                                    this.props.project.pk,
                                    this.props.issues[0].pk,
                                    onSuccess,
                                    onError)
    },

    expanded : function(groups,group){
        if (Utils.contains(groups.names,group))
            return true
        return false
    },

    limit : 1000,

    render: function() {
        var props = this.props,
            state = this.state,
            fileRevisions = props.fileRevisions,
            count = props.count

        var groups = IssueHelpers.parseIssueGroupParams(props.params)
        var expanded = this.expanded(groups,props.group)
        var issueLabels = <IssueLabels issue={props.issues[0]}/>

        var newParams = {}
        //if we want to allow selection of multiple groups...
        //var newParams = $.extend({},groups.params)
        if (!expanded)
            newParams[props.group] = {}
        else
            delete newParams[props.group]

        var links = []
        var linkSeparator = <span>&nbsp;·&nbsp;</span>

        // other links
        var providers = Settings.providers['projects.links'] || []

        providers
          .filter(function(provider) {
              return provider.component.isApplicable(props)
          })
          .forEach(function (provider) {
              if (links.length > 0)
                  links.push(linkSeparator)
              links.push(<provider.component {...props}/>)
          })

        var href = makeUrl(props.baseUrl,{groups : IssueHelpers.issueGroupParamsToUrlParams(newParams)},props.params)
        var infoElement = (
          <span className="documentation-link">
              {links}
          </span>
        )

        var content

        if (expanded)
            content = <IssuesGroupList
                    params={props.params}
                    onChange={props.onChange}
                    baseUrl={props.baseUrl}
                    project={props.project}
                    issues={props.issues}
                    resources={props.resources}
                    generateIssueItem={props.generateIssueItem}
                    issuesData={props.issuesData}
                    group={props.group} />
        else
            content = <IssuesGroupSummary
                    params={props.params}
                    baseUrl={props.baseUrl}
                    project={props.project}
                    onChange={props.onChange}
                    issues={props.issues}
                    issuesData={props.issuesData}
                    group={props.group} />

        return <div className={"element clearfix severity-"+props.issues[0].severity}>
            <div className="wrapper">
                <div className="details clearfix">
                    <div>
                        <A href={href}>
                            <h3 className="analyzer_code"><span>{props.issues[0].title}</span></h3>
                        </A>
                        {infoElement}
                    </div>
                    {content}
                    <div className="tags pull-right text-right clearfix">
                        {issueLabels}
                    </div>
                </div>
            </div>
        </div>

    }

})

export default IssuesGroup
