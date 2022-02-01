import { render }  from 'react-dom';
import React from "react"
import IssueItem from "components/issue/_issue_item"
import IssuesGroup from "components/issue/_issues_group"
import IssueHelpers from "helpers/issue"
import SnapshotApi from "api/snapshot"
import $ from "jquery"
var createReactClass = require('create-react-class');

var SnapshotIssuesGroup = createReactClass({

    displayName: 'SnapshotIssuesGroup',
    limit : IssuesGroup.prototype.limit,

    issueResources : function(props){

        var groups = IssueHelpers.parseIssueGroupParams(props.params)
        var limit = this.limit
        var params = $.extend({with_code: true,
                               limit : limit,
                               offset : (groups.params[props.group].page || 0)*limit}, params)

        var filters = $.extend(params, props.filters)
        if (props.params.ignore)
            filters.ignore = true
        filters["analyzer_code"] = props.group

        return [{
            name: 'fileRevisions',
            endpoint: SnapshotApi.getFileRevisionIssues,
            //we use this.props.project, this.props.snapshot since those are contained
            //in SnapshotIssuesGroup, and not in the props object of the class calling the func.
            params: [this.props.project.pk,this.props.snapshot.pk,props.params.path,filters],
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
                onChange={params.onChange}
                title={props.issues[0].title}
                fileViewerHref={props.fileViewerHref}
                baseUrl={props.baseUrl}
                data={props.data}
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
                baseUrl={props.baseUrl}
                project={props.project}
                user={props.user}
                issues={props.issues}
                resources={this.issueResources}
                generateIssueItem={this.generateIssueItem}
                issuesData={props.issuesData}
                group={props.group} />
    }

})

export default SnapshotIssuesGroup
