import { render }  from 'react-dom';
import React from "react"
import IssueHelpers from "helpers/issue"
import OccurrencePaginator from "components/issue/_occurrence_paginator"
import IssueStatusModal from "components/issue/_issue_status_modal"
import Utils from "utils"
import {makeUrl, A} from "routing"
import sp from "sprintf"
import Prism from "prism"
var createReactClass = require('create-react-class');

var sprintf = window.sprintf; //for some reason require.js shim does not seem to work for sprintf

var IssueItem = createReactClass({

    displayName: 'IssueItem',

    componentDidMount : function(){
        this.highlightCode()
    },

    componentDidUpdate: function(){
        this.highlightCode()
    },

    componentWillMount : function(){
        this.generateOccurrences(this.props)
    },

    componentWillReceiveProps : function(nextProps){
        this.generateOccurrences(nextProps)
    },

    generateOccurrences : function(props){
        var issueOccurrences = []

        //we add the language to the issue (needed by enrichIssues)
        props.issues.map(function(issue){issue.language = props.fileRevision.language;return issue;})
        var enrichedIssues = IssueHelpers.enrichIssues(props.issues,props.issuesData)
        for(var i in enrichedIssues){
            var issue = enrichedIssues[i]
            for(var j in issue.occurrences){
                var occurrence = issue.occurrences[j]
                occurrence.issue = issue
                issueOccurrences.push(occurrence)
            }
        }
        issueOccurrences.sort(function(a,b){return a.from_row-b.from_row})
        this.setState({issueOccurrences : issueOccurrences})
    },

    highlightCode: function(){
        var groups = IssueHelpers.parseIssueGroupParams(this.props.params)
        var issueOccurrences = this.state.issueOccurrences,
            occurrenceIndex = groups.params[this.props.group].occurrence || 0,
            activeOccurrence = issueOccurrences[occurrenceIndex] || issueOccurrences[0]
        if (this.refs.code) {
            //var codeElement = this.refs.code.getDOMNode()
            //codeElement.innerHTML = activeOccurrence.snippet.code
            //Prism.highlightElement(codeElement)
        }
    },

    render: function(){
        var props = this.props,
            filename,
            occurrencesItems = [],
            issueOccurrences = this.state.issueOccurrences,
            issues = props.issues,
            groups = IssueHelpers.parseIssueGroupParams(props.params),
            occurrenceIndex = groups.params[props.group].occurrence || 0
        var activeOccurrence = issueOccurrences[occurrenceIndex] || issueOccurrences[0]
        var occurrenceDetails
        var description

        if (props.active && activeOccurrence){
            var sprintfDict = {
                issue: activeOccurrence.issue,
                occurrence: activeOccurrence,
            }
            try {
                description = sp.sprintf(activeOccurrence.issue.description, sprintfDict)
            } catch(e) {
                description = "There was an error interpolating the issue description (check the console for detailed infos)."
                console.log(e)
                console.log("interpolation dictionary:")
                console.log(sprintfDict)
                console.log("string for interpolation:")
                console.log(activeOccurrence.issue.description)
            }
            var fileViewerHref = props.fileViewerHref(props.fileRevision)

            var codePreview
            var lineNumber
            try{
                if (activeOccurrence.from_row)
                    lineNumber = <span>Line {activeOccurrence.from_row}</span>
            }catch(e){}

            if (activeOccurrence.snippet){
                var numberOfLines = activeOccurrence.snippet.to - activeOccurrence.snippet.from
                if (numberOfLines > 0) {
                    codePreview = <A href={fileViewerHref}>
                              <pre data-line={activeOccurrence.from_row+ "-" + activeOccurrence.to_row}
                                  data-start={activeOccurrence.snippet.from-1} className="line-numbers">
                                  <code className="language-python" ref="code"></code>
                              </pre>
                            </A>
                }
            }
            else
                codePreview = <span>No code snippet available, sorry...</span>

            var makeUrlFunction = function(i){
                var newParams = IssueHelpers.updateIssueGroupParams(groups.params,props.group,{occurrence : i})
                return makeUrl(props.baseUrl,{groups : IssueHelpers.issueGroupParamsToUrlParams(newParams)},props.params)
            }.bind(this)

            var ignoreIssue = function(e){
                e.preventDefault()
                this.refs.ignoreIssueModal.open()
            }.bind(this)

            var ignoreIssueContent
            if (props.project.user_role != "anon")
                ignoreIssueContent = [
                    <A href="" onClick={ignoreIssue} className="full-file pull-right">
                        {activeOccurrence.issue.ignore ? 'un-ignore issue' : 'ignore issue'}
                    </A>,
                    <IssueStatusModal ref="ignoreIssueModal"
                                      issue={activeOccurrence.issue}
                                      project={props.project}
                                      onChange={props.onChange}
                                      baseUrl={props.baseUrl} />
                ]

            occurrenceDetails = <li>
                <div className="snippet clearfix">
                    <div className="head clearfix">
                        <div className="bar pull-left clearfix">
                            <div className="line-number pull-left">
                                {lineNumber}
                            </div>
                            <A href={fileViewerHref} className="full-file pull-right">
                                view file
                            </A>
                            {ignoreIssueContent}
                            <div className="marker">
                                <OccurrencePaginator makeUrl={makeUrlFunction}
                                                     len={issueOccurrences.length}
                                                     i={occurrenceIndex} />
                            </div>
                            <div className="description">
                                {description}
                            </div>
                        </div>
                    </div>
                    <div className="body">
                        {codePreview}
                    </div>
                </div>
            </li>;
        }

        if (props.fileRevision)
            filename = <h4>
                            <A href={this.props.href}>
                                <span className="file-name main truncate-xs">
                                    {Utils.truncateInMiddle(props.fileRevision.path,60)}
                                </span>
                            </A>
                        </h4>;

        return <li>
            {filename}
            <ul className="occurrences">
                {occurrenceDetails}
            </ul>
        </li>;
    }
});

export default IssueItem
