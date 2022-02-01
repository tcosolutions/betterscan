import { render }  from 'react-dom';

import React from "react"
import Utils from "utils"
import {redirectTo, makeUrl, A} from "routing"
import IssueHelpers from "helpers/issue"
import OffsetPaginator from "components/generic/offset_paginator"
import Content from "components/generic/content"
import Sidebar from "components/generic/sidebar"
import Toolbar from "components/generic/toolbar"
import ParameterFilter from "components/generic/filter"
import IssueClassFilters from "components/issue_class/_filters"
import ManagedIssueClassList from "components/issue_class/_managed_list"
import LoaderMixin from "components/mixins/loader"
import IssueClassApi from 'api/issue_class'
var createReactClass = require('create-react-class');

var IssueClassList = createReactClass({

    displayName: 'IssueClassList',

    mixins : [LoaderMixin],

    resources : function(props){
        var params = {sort : props.sort, direction : props.direction}
        if (props.params.query)
            params.query = props.params.query
        if (props.params.sort)
            params.sort = props.params.sort
        if (props.params.direction)
            params.direction = props.params.direction
        if (props.params.severity)
            params.severity = props.params.severity
        if (props.params.categories)
            params.categories = props.params.categories
        if (props.params.language)
            params.language = props.params.language
        if (props.params.limit)
            params.limit = props.params.limit
        if (props.params.offset)
            params.offset = props.params.offset
        if (props.params.type)
            params.type = props.params.type
        if (props.params.analyzer)
            params.analyzer = props.params.analyzer

        if (props.project.pk)
            params.project_id = props.project.pk

        var r = [{
                name : 'issueClasses',
                endpoint : IssueClassApi.getIssueClasses,
                params : [params],
                mapping : {
                    issueClasses : 'issue_classes',
                    count : 'count',
                    languages : 'languages',
                    analyzers: 'analyzers',
                    categories: 'categories'
                },
                nonBlocking : false
            }]
        return r
    },

    getDefaultProps : function(){
        return {sort : 'title', direction : 'asc', compact : false, tiles : false}
    },

    componentWillReceiveProps : function(props){
        if (props.params.query !== undefined)
            this.setState({query : props.params.query})
        else
            this.setState({query : ''})
    },

    getInitialState : function(){
        return {issueClasses : undefined,
                disabled : false,
                query : this.props.params.query !== undefined ? this.props.params.query : ''}
    },

    changeQuery : function(e){
        e.preventDefault()
        this.setState({query : e.target.value})
        this.currentQuery = e.target.value
        setTimeout(function(query){
                    if (query != this.currentQuery)
                        return
                    return this.searchIssueClasses(query);}
                    .bind(this,e.target.value),400)
        return false
    },

    searchIssueClasses : function(query){
        var final_query =  query !== undefined ? query : this.state.query
        var params = {}
        var unset_params = ['limit','offset']
        if (final_query !== undefined && final_query !== '')
            params.query = final_query
        else
            unset_params.push('query')
        redirectTo(makeUrl(this.props.baseUrl,params,this.props.params,unset_params))
        return false
    },

    afterLoadingSuccess : function(d){
        this.setState({disabled : false})
        return d
    },

    render: function () {
        var data = this.state.data
        var paginator = <OffsetPaginator count={data.count ? parseInt(data.count) : undefined} offset={this.props.params.offset ? parseInt(this.props.params.offset) :0} limit={this.props.params.limit ? parseInt(this.props.params.limit) : 20} baseUrl={this.props.baseUrl} params={this.props.params} />

        var patternFilters = <IssueClassFilters params={this.props.params}
                                                baseUrl={this.props.baseUrl}
                                                project={this.props.project}
                                                languages={data.languages}
                                                analyzers={data.analyzers}
                                                sort={this.props.params.sort || this.props.sort}
                                                direction={this.props.params.direction || this.props.direction}
                                                dropdown={false} />

        var searchForm = <form className={"search-form no-padding"} role="form" onSubmit={function(){return false;} }>
                                        <input id="query" className="filter form-control" value={this.state.query} onChange={this.changeQuery} type="query" ref="query" placeholder="Search ..." />
                                    </form>

        var mainContent
        if (data.issueClasses)
        {
            var project = data.project
            if (!project)
                project = this.props.project
            mainContent = <ManagedIssueClassList
                         project={project}
                         issueClasses={data.issueClasses}
                         user={data.user}
                         disabled={this.state.disabled}
                         simple={this.props.simple}
                         tiles={this.props.tiles}
                         onChange={function(data){if (this.props.onChange)this.props.onChange();else this.reloadResources();}.bind(this)}
                         onTriggerChange={function(data){this.setState({disabled : true});}.bind(this)}
                         params={this.props.params}
                         baseUrl={this.props.baseUrl} />
        }
        else{
            mainContent = <h4><i className="fa fa-exclamation-triangle"></i> No issue classes found</h4>
        }

        return  <Content params={this.props.params}
                         baseUrl={this.props.baseUrl}
                         toolbarLeftContent={searchForm}
                         sidebarContent={patternFilters}
                         content={mainContent}
                         paginator={paginator}
                         forceCompact={this.props.compact}  />
    }

})

export default IssueClassList
0
