import { render }  from 'react-dom';
import React from "react"
import IssueHelpers from "helpers/issue"
import OccurrencePaginator from "components/issue/_occurrence_paginator"
import Utils from "utils"
import {makeUrl, A} from "routing"
import sp from "sprintf"
import Prism from "prism"

var sprintf = window.sprintf; //for some reason require.js shim does not seem to work for sprintf

var createReactClass = require('create-react-class');

var FileRevisionIssueItem = createReactClass({

    displayName: 'FileRevisionIssueItem',

    componentDidMount : function(){
        this.highlightCode()
    },

    componentDidUpdate: function(){
        this.highlightCode()
    },

    highlightCode: function(){
        var fileRevision = this.props.fileRevision,
            occurrenceIndex = this.props.groups.params[this.props.group].occurrence || 0,
            activeOccurrence = issue.occurrences[occurrenceIndex] || issue.occurrences[0]
        if (this.refs.code) {
            //var codeElement = this.refs.code.getDOMNode()
            //codeElement.innerHTML = activeOccurrence.snippets[0][0]
            //Prism.highlightElement(codeElement)
        }
    },

    render: function(){

        /*
        We receive a file revision object which contains a list of issues that
        in turn contain a list of issue occurrences.

        We render each issue occurrence with the given information contained in the issue.

        We do this by flattening the Issue/IssueOccurrence list into a list of
        issue occurrences, which each contain the full data from the given Issue object
        and can be identified by their position in the list.
        */

        var props = this.props,
            filename,
            occurrencesItems = [],
            fileRevision = props.fileRevision,
            occurrenceIndex = props.groups.params[props.group].occurrence || 0,
            activeOccurrence = issue.occurrences[occurrenceIndex] || issue.occurrences[0]
        var issueOccurrences = []
        for(var i in fileRevision.issues){

        }
        var description = issue.description
        try {
            var sprintfDict = {
                fileRevision: fileRevision,
                occurrence: activeOccurrence,
            }
            description = sprintf(description, sprintfDict)
        } catch(e) {
            console.error("sprintf for issue description failed", descriptionText, sprintfDict)
        }

        var occurrenceDetails

        if (this.props.active && activeOccurrence){
            var fileViewerHref = makeUrl("/project/" + props.data.projectId + "/file_revision/" + fileRevision.pk)

            var codePreview
            var lineNumber
            try{
                if (activeOccurrence.location[0][0][0])
                    lineNumber = <span>line {activeOccurrence.location[0][0][0]}</span>
            }catch(e){}

            if (activeOccurrence.snippets){
                var numberOfLines = activeOccurrence.snippets[0][2] - activeOccurrence.snippets[0][1]
                if (numberOfLines > 0) {
                    codePreview = <A href={fileViewerHref}>
                              <pre data-line={activeOccurrence.location[0][0][0]+ "-" + activeOccurrence.location[0][1][0]}
                                  data-start={activeOccurrence.snippets[0][1]-1} className="line-numbers">
                                  <code className="language-python" ref="code"></code>
                              </pre>
                            </A>
                }
            }
            else
                codePreview = <span>No code snippet available, sorry...</span>

            var makeUrl = function(i){
                var newParams = IssueHelpers.updateIssueGroupParams(props.groups.params,
                                                                    props.group,
                                                                    {occurrence : i})
                return makeUrl(props.baseUrl,
                                     {groups : IssueHelpers.issueGroupParamsToUrlParams(newParams)},
                                     props.params)
            }.bind(this)

            occurrenceDetails = <li>
                <span className="description">{description}</span>
                <div className="snippet clearfix">
                    <div className="head clearfix">
                        <div className="bar pull-left clearfix">
                            <div className="line-number pull-left">
                                {lineNumber}
                            </div>
                            <A href={fileViewerHref} className="full-file pull-right">
                                View complete file
                            </A>
                            <div className="marker">
                                <OccurrencePaginator makeUrl={makeUrl}
                                                     len={issue.occurrences.length}
                                                     i={occurrenceIndex} />
                            </div>
                        </div>
                    </div>
                    <div className="body">
                        {codePreview}
                    </div>
                </div>
            </li>
        }

        if (props.showFilename)
            filename = <h4>
                            <A href={this.props.href}>
                                <span className="file-name main truncate-xs">
                                    {Utils.truncateInMiddle(issue.file_revision.path,60)}
                                </span>
                            </A>
                        </h4>

        return <li key={issue.pk}>
            {filename}
            <ul className="occurrences">
                {occurrenceDetails}
            </ul>
        </li>
    }
})

export default FileRevisionIssueItem
