import { render }  from 'react-dom';
import React from "react"
import Toolbar from "components/generic/toolbar"
import Sidebar from "components/generic/sidebar"
import LoaderMixin from "components/mixins/loader"
import FilteredIssueList from "components/issue/_filtered_list"
import IssuesFilters from "components/issue/_filters"
import PathIssueFilter from "components/issue/_path_issue_filter"
import DiffIssuesGroup from "components/diff/_diff_issues_group"
import ParameterFilter from "components/generic/filter"
import Utils from "utils"
import {makeUrl, A} from "routing"
import IssueHelpers from "helpers/issue"
var createReactClass = require('create-react-class');

var GenericDiffInfoBox = createReactClass({
    displayName: "GenericDiffInfoBox",

    render: function(){
        var snapshotAId = this.props.data.snapshotAId
        var snapshotBId = this.props.data.snapshotBId
        var snapshotAHref = makeUrl("/project/" + this.props.data.projectId + "/snapshot/" + snapshotAId, this.props.params)
        var snapshotBHref = makeUrl("/project/" + this.props.data.projectId + "/snapshot/" + snapshotBId, this.props.params)

        return <div className="alert alert-info">
                  Issues that were introduced/resolved between <A href={snapshotAHref}>Commit {snapshotAId.substr(0, 8)}</A> and <A href={snapshotBHref}>Commit {snapshotBId.substr(0,8)}</A>.
              </div>
    }
})

var DiffIssues = createReactClass({
    displayName: 'DiffIssues',

    mixins : [LoaderMixin],

    getDefaultProps : function(){
        return {
            filterAttributes: [
                "categories",
                "severity",
                "code",
                "analyzer_code",
                "analyzer"
            ]
        }
    },

    loadIssues : function(params,onSuccess,onError){
        var props = this.props
        var issueType = props.params.issue_type || 'added'
        var params = $.extend({with_code: true, issue_type: issueType}, params)
        return this.apis.diff.getIssues(
            props.data.projectId,
            props.data.snapshotAId,
            props.data.snapshotBId,
            params,
            onSuccess,
            onError
        )
    },

    resources : function(props){
        var r = [
            {
                name: 'issuesSummary',
                endpoint : this.apis.diff.getIssuesSummary,
                params : [props.data.projectId,props.data.snapshotAId,props.data.snapshotBId,{}],
                mapping : {issuesSummary : 'summary'},
            },
            {
                name : 'issuesData',
                endpoint : this.apis.issue.getIssuesData,
                params : [props.data.projectId],
                mapping : {issuesData : 'issues_data'},
            },
        ]
        if (Utils.isLoggedIn())
            r.push({
                name: 'user',
                endpoint: this.apis.user.getUser,
                params : [{}],
            })
        return r
    },

    render : function(){
        var data = this.state.data,
            props = this.props,
            path = props.params.path || '',
            issueType = props.params.issue_type || 'added',
            filters = IssueHelpers.extractFilters(props.params, props.filterAttributes),
            issues = {}

        var issueTitles = {added: 'New', fixed: 'Resolved'}

        var issueTypeValues = []

        Object.keys(issueTitles).forEach(function(issueType) {
            issues[issueType] = IssueHelpers.generateIssuesFromSnapshotSummary(
                        data.issuesSummary[issueType],
                        path,
                        data.issuesData)
            var count = IssueHelpers.countFor(issues[issueType])[1]
            issueTypeValues.push({value: issueType, title: issueTitles[issueType], count: count})
        })

        var issueTypeFilter = function(dropdown){return <ParameterFilter values={issueTypeValues}
                                           baseUrl={props.baseUrl}
                                           title="Status"
                                           param="issue_type"
                                           dropdown={dropdown}
                                           default="added"
                                           params={props.params} />
                                       }


        var infoBox = <GenericDiffInfoBox
                baseUrl={this.props.baseUrl}
                params={this.props.params}
                data={this.props.data} />

        var fileViewerHref = function(fileRevision){
            var snapshotId
            if (issueType == 'added')
                snapshotId = props.data.snapshotBId
            else
                snapshotId = props.data.snapshotAId
            return makeUrl("/project/" + props.project.pk + "/snapshot/" + snapshotId+"/file/"+fileRevision.path)
        }.bind(this)

        return <div className="snapshot-details">
                  {infoBox}
                  <FilteredIssueList
                      issuesSummary={data.issuesSummary[issueType]}
                      issuesData={data.issuesData}
                      project={props.project}
                      filters={filters}
                      path={path}
                      fileViewerHref={fileViewerHref}
                      IssuesGroup={DiffIssuesGroup}
                      issuesGroupProps={{issueType : issueType, user : data.user}}
                      data={props.data}
                      baseUrl={props.baseUrl}
                      params={props.params}
                      loadIssues={this.loadIssues}
                      onChange={this.reloadResources}
                      emptyPlaceholder={this.createIssueListPlaceholder(issueType, path, filters)}
                      additionalFilters={issueTypeFilter} />
                </div>
    },

    createIssueListPlaceholder: function(issueType, path, filters) {
        var text
        var alertType
        if(issueType == "added") {
          alertType = "alert-success"
          text = "No new issues were introduced"
        } else if(issueType == "fixed") {
          alertType = "alert-success"
          text = "No issues were resolved"
        }
        if (path) {
          pathText += " within the path " + path
        }
        if(Object.keys(filters).length) {
          text += " that match your current filters"
        }
        var pathText
        return <p className={"alert " + alertType}>{text}.</p>
    }
})

export default DiffIssues
