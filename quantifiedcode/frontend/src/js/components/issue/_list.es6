import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import Modal from "components/generic/modal"
import IssueHelpers from "helpers/issue"
import Utils from "utils"
import $ from "jquery"
import {A, makeUrl} from "routing"

var createReactClass = require('create-react-class');



var IssuesList = createReactClass({
    displayName: 'IssuesList',

    propTypes: {
        //the element which will be displayed if there
        //are no issues
        emptyPlaceholder: PropTypes.node.isRequired,
        //this list is incomplete...
    },

    getInitialState : function(){
        return {
            issuesGroups: []
        }
    },

    componentWillMount : function(){
        this.updateIssues(this.props)
    },

    componentWillReceiveProps: function(props){
        this.updateIssues(props)
    },

    updateIssues: function(props){
        var filteredIssues = IssueHelpers.filterIssues(
                props.issues,
                props.filters
            )
        this.setState({
            issuesGroups: IssueHelpers.groupIssuesByAnalyzerCode(filteredIssues),
        })
    },

    render: function(){
        var state = this.state,
            props = this.props
        var issuesGroups = state.issuesGroups.map(function(issuesGroup) {
            var group = issuesGroup.key
            return React.createElement(props.IssuesGroup,$.extend({
                data: props.data,
                key: group,
                group : group,
                onChange: props.onChange,
                filters: props.filters,
                issues : issuesGroup.issues,
                showFilename : props.showFilename,
                issuesData : props.issuesData,
                fileViewerHref : props.fileViewerHref,
                params : props.params,
                baseUrl : props.baseUrl,
                project : props.project
            },props.issuesGroupProps))
        }.bind(this))

        var ignore = !!props.params.ignore

        var ignoredMessage
        if (ignore)
            ignoredMessage = <p>Showing ignored issues. <A href={makeUrl(this.props.baseUrl, this.props.params, {},['ignore'])}>Show normal issues instead.</A></p>
        else
            ignoredMessage = <p><A href={makeUrl(this.props.baseUrl, this.props.params, {ignore : true})}>Show ignored issues.</A></p>

        if (!issuesGroups.length){
            return <div id="issues_group_list" className="content-box">
                        <div className="body">
                            {props.emptyPlaceholder}
                        </div>
                    </div>
        } else {
            return <div>
                    <div id="issues_group_list" className="issues-group-list">
                    {issuesGroups}
                    <div className="links">
                        {ignoredMessage}
                    </div>
                </div>
            </div>
        }
    }
})

export default IssuesList
