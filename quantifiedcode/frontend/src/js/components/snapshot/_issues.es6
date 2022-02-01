import { render }  from 'react-dom';
import SnapshotApi from "api/snapshot"
import React from "react"
import FilteredIssueList from "components/issue/_filtered_list"
import SnapshotIssuesGroup from "./_snapshot_issues_group"
import SnapshotLoadingError from "./_loading_error"
import SnapshotSelector from "./_snapshot_selector"
import LoaderMixin from "components/mixins/loader"
import Utils from "utils"
import {makeUrl} from "routing"
import IssueHelpers from "helpers/issue"

var createReactClass = require('create-react-class');

var SnapshotIssues = createReactClass({

    displayName: 'SnapshotIssues',

    mixins : [LoaderMixin],

    resources : function(props){
        var snapshotId = this.getSnapshotId()
        var summaryParams = {}
        if (props.params.ignore)
            summaryParams.ignore = true
        var r = [
            {
                name: 'snapshot',
                endpoint : this.apis.snapshot.getDetails,
                params : [props.data.projectId,snapshotId,{}],
                nonCritical : true
            },
            {
                name: 'issuesSummary',
                endpoint : this.apis.snapshot.getIssuesSummary,
                params : [props.data.projectId,snapshotId,summaryParams],
                mapping : {issuesSummary : 'summary'},
                nonCritical : true
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
            }
        )
        return r
    },

    getSnapshotId: function() {
        var props = this.props
        return props.data.snapshotId || (props.params.branch ? props.params.branch.replace(/\//g,':')+':HEAD' : ':HEAD')
    },

    componentDidMount : function() {
        Utils.trackEvent("Usage", "Project issues viewed")
    },

    render : function(){
        var state = this.state,
            data = state.data,
            props = this.props

        var fileViewerHref = function(fileRevision){
            return makeUrl("/project/" + props.project.pk + "/snapshot/" + data.snapshot.pk+"/file/"+fileRevision.path)
        }.bind(this)

        var content
        if(data.snapshot && data.issuesSummary) {
            var path = props.params.path || ""
            var filterAttributes = ["categories", "language", "severity", "code", "analyzer_code", "analyzer"]
            var filters = IssueHelpers.extractFilters(props.params, filterAttributes)
            var issuesSummary = data.issuesSummary
            content = <FilteredIssueList
                issuesSummary={data.issuesSummary}
                issuesData={data.issuesData}
                project={props.project}
                filters={filters}
                onChange={this.reloadResources}
                fileViewerHref={fileViewerHref}
                path={path}
                IssuesGroup={SnapshotIssuesGroup}
                issuesGroupProps={{snapshot : data.snapshot, user : data.user}}
                data={props.data}
                baseUrl={props.baseUrl}
                params={props.params}
                snapshot={data.snapshot}
                emptyPlaceholder={this.createIssueListPlaceholder(path, filters)} />
        } else {
          content = <SnapshotLoadingError
              project={props.project}
              reload={this.reloadResources} />
        }

        return <div>
                    <div className="space-top-20 space-bottom-10">
                        <SnapshotSelector project={props.project}
                                          snapshot={data.snapshot}
                                          params={props.params}
                                          baseUrl={props.baseUrl} />
                    </div>
                    {content}
                </div>
    },

    createIssueListPlaceholder: function(path, filters) {
        if (!Object.keys(filters).length && path === ""){
          return <h3 className="alert alert-success"><span className="mega-octicon octicon-check" /> No issues found in this project. Congrats!</h3>
        }
        var pathText
        if (path) {
          pathText = <span> within the path <strong>{path}</strong></span>
        }
        return <p className="alert">We could not find any issues for your selection of filters{pathText}.</p>
    },
})

export default SnapshotIssues
