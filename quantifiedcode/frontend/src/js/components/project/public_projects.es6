import React from "react"
import { render } from "react-dom"
import Utils from "utils"
import {makeUrl, redirectTo, A} from "routing"
import ProjectApi from "api/project"
import OffsetPaginator from "components/generic/offset_paginator"
import Toolbar from "components/generic/toolbar"
import QueryInfo from "components/generic/query_info"
import LoaderMixin from "components/mixins/loader"
import PublicProjectList from "components/project/_public_project_list"
import OrderByBox from "components/generic/orderby_box"

var createReactClass = require('create-react-class');

var PublicProjects = createReactClass({

    mixins : [LoaderMixin],

    getDefaultProps : function(){
      return {sort: 'analyzed_at', direction: 'desc'}
    },

    resources : function(props){
      if(props === undefined)
        props = this.props

      var params = {sort : props.sort, direction : props.direction}
      if (props.params.show_failed !== undefined)
        params['show_failed'] = true
      if (props.params.query !== undefined)
        params['query'] = props.params.query
      if (props.params.sort !== undefined)
        params.sort = props.params.sort
      if (props.params.direction !== undefined)
        params.direction = props.params.direction
      else
        params.direction = 'desc'
      if (props.params.limit !== undefined)
        params.limit = props.params.limit
      if (props.params.offset !== undefined)
        params.offset = props.params.offset

      return [
        {
          name : 'projects',
          endpoint : this.apis.project.getPublicProjects,
          params : [params],
          mapping : {
            projects : 'projects',
            count : 'count'
          },
          nonBlocking : false
        }
      ]
    },

    componentWillReceiveProps : function(props){
      if (props.params.query !== undefined)
        this.setState({query : props.params.query})
      else
        this.setState({query : ''})
    },

    getInitialState : function(){
      return {projects: [],query : this.props.params.query !== undefined ? this.props.params.query : ''}
    },

    changeQuery : function(e){
      e.preventDefault()
      this.setState({query : e.target.value})
      this.currentQuery = e.target.value
      setTimeout(function(query){if (query != this.currentQuery){return;}return this.searchProjects(query);}.bind(this,e.target.value),400)
    },

    searchProjects : function(query){
      var final_query = query !== undefined ? query : this.state.query
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
      var props = this.props

      var orderByBox = <OrderByBox
        sortOrders={[
                  {title: 'last analysis date', key: 'analyzed_at'},
                  {title: 'name', key: 'name', defaultDirection: 'asc'}
              ]}
        sort={props.params.sort ? props.params.sort : props.sort}
        direction={props.params.direction ? props.params.direction : props.direction}
        params={this.props.params}
        baseUrl={this.props.baseUrl}
        right={true} />

      var data = this.state.data
      var paginator = <OffsetPaginator count={data.count !== undefined ? parseInt(data.count) : undefined} offset={this.props.params.offset !== undefined ? parseInt(this.props.params.offset) :0} limit={this.props.params.limit !== undefined ? parseInt(this.props.params.limit) : 20} baseUrl={this.props.baseUrl} params={this.props.params} />

      var toolbarContent = <div className="criterias">
        <div className="col-xs-12 col-sm-8 no-padding">
          <form className="search-form pull-left" role="form" onSubmit={function(){return false;} }>
            <input id="query" className="filter form-control pull-right" value={this.state.query} onChange={this.changeQuery} type="query" ref="query" placeholder="Search open source projects..." />
          </form>
        </div>
        <div className="col-xs-12 col-sm-4 no-padding">
          <ul className="dropdowns">
            {orderByBox}
          </ul>
        </div>
      </div>

      var dismissInfo = function(e){
        Utils.store('dismissProjectInfo',true)
        this.setState({dismissed : true})
        e.preventDefault()
      }.bind(this)

      var intro
      var newProject
      if (!Utils.store('dismissProjectInfo') && !Utils.isLoggedIn())
        intro = <div className="row">
          <div className="col-xs-12">
            <div className="alert alert-warning" role="alert">
              <button type="button"
                      className="close"
                      aria-label="Close" onClick={dismissInfo}>
                <span aria-hidden="true">&times;</span>
              </button>
              <h4>Hi there!</h4>
              <p>
                This is a list of public projects that we have analyzed on our platform. To add your own project, <A href={makeUrl("/user/signup")}>sign up for free.</A>
              </p>
            </div>
          </div>
        </div>
      else if (Utils.isLoggedIn())
        newProject = <div className="pull-right space-top-10">
          <A className="btn btn-primary" href={makeUrl("/project/new")}><i className="fa fa-plus" /><span className="hidden-xs"> Add project</span></A>
        </div>

      var headline

      if (this.props.title !== '')
        headline = <h1 className="headline pull-left">{this.props.title !== undefined ? this.props.title : 'Public projects'}</h1>

      return <div id="public-projects">
        <div className="row">
          <div className="col-xs-12">
            {headline}
            {newProject}
            {intro}
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <Toolbar>{toolbarContent}</Toolbar>
            <div className="pl no-padding" itemScope itemType="http://schema.org/Code">
              <QueryInfo params={this.props.params} baseUrl={this.props.baseUrl} />
              <PublicProjectList projectLink={this.props.projectLink}
                                 onChange={this.loadResources}
                                 projects={data.projects}
                                 params={this.props.params}
                                 baseUrl={this.props.baseUrl} />
              {paginator}
            </div>
          </div>
        </div>
      </div>

    }

})

export default PublicProjects
