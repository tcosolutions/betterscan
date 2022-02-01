import { render }  from 'react-dom';
import React from "react"
import LoaderMixin from "components/mixins/loader"
import PathSelector from "components/generic/path_selector"
import Content from "components/generic/content"
import Sidebar from "components/generic/sidebar"
import Toolbar from "components/generic/toolbar"
import IssuesFilters from "components/issue/_filters"
import IssueCodeEditor from "components/issue/_code_editor"
import Utils from "utils"
import IssueHelpers from "helpers/issue"
var createReactClass = require('create-react-class');

var FileViewer = createReactClass({
    displayName: "FileViewer",

    mixins : [LoaderMixin],

    resources: function(props){
        return [
            {
                name : 'issues_data',
                endpoint : this.apis.issue.getIssuesData,
                params : [props.data.projectId],
                mapping : {issuesData : 'issues_data'}
            },
            {
                name : 'file_revision',
                endpoint : this.apis.snapshot.getFileRevisionDetails,
                params : [props.data.projectId,
                          props.data.snapshotId,
                          props.data.path,
                          {with_code : true}],
                mapping : {fileRevision : 'file_revision'}
            },
            {
                name : 'issues',
                endpoint : this.apis.snapshot.getFileRevisionIssues,
                params : [props.data.projectId,props.data.snapshotId,props.data.path,{}],
                mapping : {fileRevisions : 'file_revisions',count : 'count'}
            }
        ]
    },

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

    getInitialState: function(){
        return {
            fileRevision: undefined,
            issues: []
        }
    },

    render: function(){
        var state = this.state,
            data = state.data,
            props = this.props,
            fileRevision = data.fileRevision,
            issues = data.fileRevisions[0].issues

        issues.map(function(issue){issue.language = fileRevision.language})

        //count issue occurrences for the issues
        //(necessary for correct counts in filter box)
        issues.forEach(function(issue) {
            issue.count = [1,issue.occurrences.length]
        })
        var enrichedIssues = IssueHelpers.enrichIssues(issues, data.issuesData)

        var filters = IssueHelpers.extractFilters(props.params, props.filterAttributes)
        //generate the issues filter box
        var issuesFilters = <IssuesFilters issues={enrichedIssues}
                                params={props.params}
                                baseUrl={props.baseUrl}
                                filters={filters}
                                dropdown={false} />

        //filter the issues according to the current filter settings and enrich them
        var currentFilters = {};

        ["severity","categories"].forEach(function(attribute) {
            if (props.params.hasOwnProperty(attribute))
                currentFilters[attribute] = props.params[attribute]
        })
        var filteredIssues = IssueHelpers.filterIssues(enrichedIssues, currentFilters)

        //display the code with the filtered issues
        var code = <IssueCodeEditor code={data.fileRevision.code.content}
                        issues={filteredIssues}
                        params={props.params} />

        //display the path
        var pathComponents = data.fileRevision.path.split("/").map(function(pathComponent){
          return {title: pathComponent}
        })
        pathComponents.unshift({title: <i className="octicon octicon-file-directory" />})

        var pathSelector = <PathSelector path={pathComponents}/>

        return  <Content params={props.params}
                        baseUrl={props.baseUrl}
                        toolbarLeftContent={pathSelector}
                        sidebarContent={issuesFilters}
                        content={code}
                        contentId={"file_revision"} />
    }
})

export default FileViewer
