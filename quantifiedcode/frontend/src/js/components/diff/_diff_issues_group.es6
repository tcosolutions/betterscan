import { render }  from 'react-dom';
import React from "react"
import IssueItem from "components/issue/_issue_item"
import IssuesGroup from "components/issue/_issues_group"
import IssueHelpers from "helpers/issue"
import DiffApi from "api/diff"
import $ from "jquery"

var createReactClass = require('create-react-class');

var DiffIssuesGroup = createReactClass({

    displayName: 'DiffIssuesGroup',
    limit : IssuesGroup.prototype.limit,

    issueResources : function(props){

        var groups = IssueHelpers.parseIssueGroupParams(props.params)

        var params = $.extend({with_code: true,
                               issue_type : this.props.issueType,
                               limit : this.limit,
                               offset : (groups.params[props.group].page || 0)*this.limit}, params)

        var filters = $.extend(params, props.filters)
        filters["analyzer_code"] = props.group

        return [{
            name: 'fileRevisions',
            endpoint: DiffApi.getFileRevisionIssues,
            params: [this.props.project.pk,this.props.data.snapshotAId,this.props.data.snapshotBId,props.params.path,filters],
            mapping: {fileRevisions : 'file_revisions',
                      count: 'count'}
        }]
    },

    generateIssueItem : function(params){
        var props = this.props
        return <IssueItem
                   fileRevision={params.fileRevision}
                   issues={params.fileRevision.issues}
                   key={params.fileRevision.pk}
                   href={params.issueHref}
                   active={params.active}
                   baseUrl={props.baseUrl}
                   fileViewerHref={props.fileViewerHref}
                   data={props.data}
                   onChange={params.onChange}
                   group={props.group}
                   issuesData={props.issuesData}
                   params={props.params}
                   project={props.project}
                   snapshot={props.snapshot} />
    },

    render : function(){
        var props = this.props,
            state = this.state
        return <IssuesGroup
                    params={props.params}
                    user={props.user}
                    issues={props.issues}
                    baseUrl={props.baseUrl}
                    generateIssueItem={this.generateIssueItem}
                    project={props.project}
                    issuesData={props.issuesData}
                    group={props.group}
                    resources={this.issueResources} />
    }

})

export default DiffIssuesGroup
