import React from "react"
import {render}  from 'react-dom';

import Utils from "utils"
import {A, redirectTo, makeUrl} from "routing"
import ProjectApi from "api/project"
import OrderByBox from "components/generic/orderby_box"
import OffsetPaginator from "components/generic/offset_paginator"
import Toolbar from "components/generic/toolbar"
import QueryInfo from "components/generic/query_info"
import Icon from "components/generic/icon"
import LoaderMixin from "components/mixins/loader"
import IssueHelpers from "helpers/issue"
import Moment from "moment"

var createReactClass = require('create-react-class');

var ProjectItem = createReactClass({

    displayName: 'ProjectItem',

    render : function(){

        var project = this.props.project

        var leftBadges = []
        if (project.stats && project.stats.summary && project.stats.summary.issues)
            leftBadges.push(<li><span className="issues">{project.stats.summary.issues} Issues</span></li>)

        if (project.stats && project.stats.contributors)
            leftBadges.push(<li><span className="contributors"> {project.stats.contributors} Contributors</span></li>)

        var privacyLabel = ''
        if (project.public == false) {
            privacyLabel = <span className="label label-warning pull-left">Private</span>
        }

        var rightBadges = []

        if (project.analyzed_at){
            var lastAnalysisDate = <span className="last-analysis-date">
                {Moment(project.analyzed_at).calendar(null, {
                              sameDay: '[Today] hh:mm A',
                              lastDay: '[Yesterday] hh:mm A',
                              lastWeek: 'MM/DD/YYYY hh:mm A',
                              sameElse : 'MM/DD/YYYY hh:mm A'
                            })}
            </span>
            var stateLabel
            switch(project.analysis_status){
                case 'failed':
                    if(project.last_fetch_returncode !== 0) {
                       stateLabel = <span className="label label-danger pull-left space-left-5">Error: Fetch failed</span>
                    } else {
                        stateLabel = <span className="label label-danger space-left-5">Failed</span>
                    }
                    break
                case 'in_progress':
                    stateLabel = "(in progress)"
                    break
            }
            rightBadges.push(<span>Analyzed: {lastAnalysisDate} {privacyLabel} {stateLabel}</span>)
        }

        return  <li className="element clearfix project" data-project-id={project.pk}>
            <div className="settings pull-right text-center" href="#">
                <A href={makeUrl("/project/" + project.permalink + "/settings")}>
                    <Icon name="gear" />
                </A>
            </div>
            <A href={makeUrl("/project/" + project.permalink)} className="box-link project-link">
                <div className="head clearfix">
                    <h2 className="pull-left truncate-xs">{this.props.project.name}</h2>
                </div>
                <ul className="meta">
                    {leftBadges}
                </ul>
                <div className="info clearfix">
                    <div className="row">
                        <span className="analysis-timestamp col-xs-12 pull-right text-right">
                            {rightBadges}
                        </span>
                    </div>
                </div>
            </A>
        </li>
    }
})


var ProjectList = createReactClass({

    displayName: 'ProjectList',

    render : function(){
        var projectItems = this.props.projects.map(function (project) {
              return <ProjectItem project={project} key={project.pk}></ProjectItem>
            })
        if (projectItems.length)
            return  <ul id="project-list" className="project-list">
                        {projectItems}
                    </ul>
        else if (!this.props.loading)
            return  <div id="project-list" className="no-results">
                        <h2>No project matches your search criteria.</h2>
                    </div>
        else
            return <div id="project-list" className="no-results">
                    <h2>Please wait, we are loading your projects ...<i className="fa fa-spin fa-refresh" /></h2>
                </div>
    }
})

var UserProjects = createReactClass({

    displayName: 'UserProjects',

    mixins : [LoaderMixin],

    resources : function(props){
        var params = {sort : props.sort, direction : props.direction}
        if (props.params.query !== undefined)
            params['query'] = props.params.query
        if (props.params.sort !== undefined)
            params.sort = props.params.sort
        if (props.params.direction !== undefined)
            params.direction = props.params.direction
        if (props.params.limit !== undefined)
            params.limit = props.params.limit
        if (props.params.offset !== undefined)
            params.offset = props.params.offset

        return [
            {
                name: 'projects',
                endpoint: this.apis.project.getUserProjects,
                params: [params],
                mapping: {
                    projects: 'projects',
                    count: 'count'
                },
            },
            {
                name: 'user',
                endpoint: this.apis.user.getUser,
                params: [{}],
                mapping: {
                    user: 'user',
                    private_project_limit_violation: 'private_project_limit_violation'
                },
            }
        ]
    },

    getDefaultProps : function(){
        return {sort : 'analyzed_at',direction : 'desc'}
    },

    componentWillReceiveProps : function(props){
        if (props.params.query !== undefined)
            this.setState({query : props.params.query})
        else
            this.setState({query : ''})
    },

    getInitialState : function(){
        return {projects : undefined,
                query : this.props.params.query !== undefined ? this.props.params.query : ''}
    },

    changeQuery : function(e){
        e.preventDefault()
        this.setState({query : e.target.value})
        this.currentQuery = e.target.value
        setTimeout(function(query){
                    if (query != this.currentQuery)
                        return
                    return this.searchProjects(query);}
                    .bind(this,e.target.value),400)
    },

    searchProjects : function(query){
        var final_query =  query !== undefined ? query : this.state.query
        var params = {}
        var unset_params = ['limit','offset']
        if (final_query !== undefined && final_query !== '')
            params['query'] = final_query
        else
            unset_params.push('query')
        redirectTo(makeUrl(this.props.baseUrl,params,this.props.params,unset_params))
        return false
    },

    render: function () {
        var props = this.props,
            state = this.state,
            data = this.state.data
        var filters = [
            {
                'title': 'last analysis date',
                'sort': 'analyzed_at'
            },
        ]

        var paginator = <OffsetPaginator
            count={data.count !== undefined ? parseInt(data.count) : undefined}
            offset={props.params.offset !== undefined ? parseInt(props.params.offset) :0}
            limit={props.params.limit !== undefined ? parseInt(props.params.limit) : 20}
            baseUrl={props.baseUrl}
            params={props.params}/>

        var newProject
        if (Utils.isLoggedIn())
            newProject = <div className="pull-right space-top-10">
                            <A className="btn btn-primary" href={makeUrl("/project/new")}><i className="fa fa-plus" /><span className="hidden-xs"> Add project</span></A>
                        </div>

        var limitViolationWarning
        if(data.private_project_limit_violation) {
            var limitViolation = data.private_project_limit_violation
            limitViolationWarning = <div className="alert alert-warning">
                                          You currently have {limitViolation.current_count} private project(s).
                                          Starting from {Moment(limitViolation.enforcement_time*1000).calendar()} your plan contains {limitViolation.new_limit} private project(s) only.
                                          Please delete {limitViolation.current_count - limitViolation.new_limit} of your private project(s).
                                    </div>
        }

        if (data.projects.length > 0 || this.props.params.query) {
            return <div id="user-projects">
                <div className="row">
                    <div className="col-xs-12">
                        <h1 className="headline pull-left">Your projects</h1>
                        {newProject}
                    </div>
                </div>
                {limitViolationWarning}
                <div className="row">
                    <div className="col-xs-12">
                        <Toolbar>
                            <div className="criterias">
                                <form className="search-form pull-left col-xs-12 no-padding" role="form" onSubmit={function(e){e.preventDefault(); return false;} }>
                                    <input id="query" className="filter form-control pull-right" value={state.query} onChange={this.changeQuery} type="query" ref="query" placeholder="Search project ..." />
                                </form>
                                <div className="col-xs-7 no-padding">
                                    <ul className="dropdowns">
                                    </ul>
                                </div>
                            </div>
                        </Toolbar>
                        <div className="pl no-padding">
                            <QueryInfo params={this.props.params} baseUrl={this.props.baseUrl} />
                            <ProjectList
                                projects={data.projects}
                                params={props.params}
                                baseUrl={props.baseUrl} />
                            {paginator}
                        </div>
                    </div>
                </div>
            </div>
        } else {
            return <div className="jumbotron vertical-center">
                <div className="row">
                    <div className="col-xs-12">
                        <h1>Welcome!</h1>
                        <p>It seems that you haven't created any projects yet. Let us change that!</p>

                        <A className="btn btn-lg btn-primary space-top-20" href={makeUrl("/project/new")}>Add New Project</A>
                    </div>
                </div>
            </div>
        }
    }
})

export default UserProjects
