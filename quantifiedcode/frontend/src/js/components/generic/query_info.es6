import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import Utils from "utils"
import {makeUrl, A} from "routing"
import IssueHelpers from "helpers/issue"

var createReactClass = require('create-react-class');

var QueryInfo = createReactClass({
    displayName: 'QueryInfo',

    propTypes: {
      baseUrl: PropTypes.string.isRequired,
      params: PropTypes.object.isRequired,
    },

    render : function(){
        var filterInfo = []

        if (this.props.params.query)
            filterInfo.push(<span key="query">query: {this.props.params.query}</span>)

        if (this.props.params.issue_type){
            var issueTypeTitle
            switch(this.props.params.issue_type){
                case 'added':issueTypeTitle = 'new';break
                case 'fixed':issueTypeTitle = 'resolved';break
                default:issueTypeTitle = 'all';break
            }
            filterInfo.push(<span key="issue_type">status: {issueTypeTitle}</span>)
        }

        if (this.props.params.hasOwnProperty("severity")) {
            var severity = this.props.params.severity
            if(!Array.isArray(severity))
                severity = [severity]

            var severityStrings = severity.map(function(s) {
                return IssueHelpers.titleForAttributeValue("severity", parseInt(s))
            })
            filterInfo.push(<span key="severity">severity: {severityStrings.join(', ')}</span>)
        }

        if(this.props.params.hasOwnProperty("categories")) {
            var categories = this.props.params.categories
            if (!Array.isArray(categories))
                categories = [categories]
            var categoryStrings = categories.map(function(s) {
                return s
            })
            filterInfo.push(<span key="categories">categories: {categoryStrings.join(', ')}</span>)
        }

       if(this.props.params.hasOwnProperty("language")) {
            var language = this.props.params.language
            if (!Array.isArray(language))
                language = [language]
            var languageStrings = language.map(function(s) {
                return s
            })
            filterInfo.push(<span key="language">languages: {languageStrings.join(', ')}</span>)
        }

       if(this.props.params.hasOwnProperty("analyzer")) {
            var analyzer = this.props.params.analyzer
            if (!Array.isArray(analyzer))
                analyzer = [analyzer]
            var analyzerStrings = analyzer.map(function(s) {
                return s
            })
            filterInfo.push(<span key="analyzer">analyzers: {analyzerStrings.join(', ')}</span>)
        }

        if (this.props.params.sort)
            filterInfo.push(<span key="sort">sort: {this.props.params.sort}</span>)

        if (this.props.params.ignore)
            filterInfo.push(<span key="ignored">ignored: {this.props.params.ignore}</span>)

        if (this.props.params.direction)
            filterInfo.push(<span>direction: {this.props.params.direction}</span>)

        if (this.props.params.type)
            filterInfo.push(<span>type: {this.props.params.type}</span>)

        if (filterInfo.length > 0) {
            return <p className="query-info">
                        <A className="btn btn-xs space-right-20" href={makeUrl(this.props.baseUrl, {}, this.props.params, ["ignore", "severity", "category", "language", "categories", "issue_type", "query", "sort", "direction", "type", "analyzer"])}><i className="fa fa-times" /> Reset all filters</A>
                        {filterInfo}
                   </p>
        } else {
            return <div />
        }
    }
})

export default QueryInfo
