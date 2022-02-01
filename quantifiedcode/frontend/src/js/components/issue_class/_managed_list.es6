import { render }  from 'react-dom';
import React from "react"
import IssueClassApi from "api/issue_class"
import ToggleSwitch from "components/generic/toggle_switch"
import Utils from "utils"
import {makeUrl, redirectTo, A} from "routing"
import $ from "jquery"
var createReactClass = require('create-react-class');

var IssueClassItem = createReactClass({

    displayName: 'IssueClassItem',

    addIssueClassToProject : function(){
        IssueClassApi.addIssueClassToProject(this.props.project.pk,
                                                this.props.issueClass.pk,{},
                                                this.props.onChange,
                                                this.props.onChange)
    },

    removeIssueClassFromProject : function(){
        IssueClassApi.removeIssueClassFromProject(this.props.project.pk,
                                              this.props.issueClass.pk,
                                              this.props.onChange,
                                              this.props.onChange)
    },

    getDefaultProps : function(){
        return {tiles : false}
    },

    getInitialState : function(){
        return {}
    },

    onToggle : function(state){
        if (this.props.onTriggerChange)
            this.props.onTriggerChange(this)
        if (state){
            this.addIssueClassToProject()
        }else{
            this.removeIssueClassFromProject()
        }
    },

    render : function(){
        var issueClass = this.props.issueClass
        var badges = []

        var issueClassId = this.props.issueClass.pk

        var enabled = false
        var toggleSwitch
        var tags

        if (issueClass.tags) {
            tags = issueClass.tags.map(function(tag,i){
                return [<span className="tag"><A href="#" onClick={function(e){redirectTo(makeUrl(this.props.baseUrl,{query : 'tag:'+tag},this.props.params,['limit','offset']));e.preventDefault();}.bind(this)}>{tag}</A></span>,' ']
            }.bind(this))
        }

        $('[data-toggle="tooltip"]').tooltip()
        var categories = this.props.issueClass.categories.map(function(category){
            return <li data-toggle="tooltip" data-placement="top" title={Utils.capitalizeFirstChar(category)}><span className={"label label-"+category}></span></li>
        }.bind(this))

        // Check if issue class is enabled on a certain project
        if (issueClass.used_by_project)
            enabled = true

        if (this.props.project) {
            toggleSwitch = <ToggleSwitch size="btn-xs"
                                         on={enabled}
                                         disabled={this.props.disabled}
                                         onChange={this.onToggle} />
        }

        var infos = [<span className="language">{issueClass.language}</span>,
                     <span className="analyzer">{issueClass.analyzer}</span>]
        var badgesAndTags

        if (!this.props.simple)
            badgesAndTags = <div className="clearfix badges">
                    {badges}
                    {tags}
                    <div className="pull-right">
                        <ol className="categories">{categories} {infos}</ol>
                    </div>
                </div>

        return  <li className={"element issue-class clearfix severity-"+this.props.issueClass.severity}>
                    <span className="settings">
                        {toggleSwitch}
                    </span>
                    <h4>{this.props.issueClass.title}</h4>
                    {badgesAndTags}
                </li>
    }
})

var IssueClassList = createReactClass({

    displayName: 'IssueClassList',

    render : function(){
        var issueClassItems = this.props.issueClasses.map(function (issueClass,i) {
              return <IssueClassItem project={this.props.project}
                                  issueClass={issueClass}
                                  clickToAdd={this.props.clickToAdd}
                                  projectId={this.props.projectId}
                                  params={this.props.params}
                                  simple={this.props.simple}
                                  user={this.props.user}
                                  disabled={this.props.disabled}
                                  baseUrl={this.props.baseUrl}
                                  onTriggerChange={this.props.onTriggerChange}
                                  onChange={this.props.onChange}
                                  key={i} />
            }.bind(this))
        var notFound = ""
        if (!issueClassItems.length) {
            issueClassItems = [
                <li className="element issue-class not-found clearfix">
                    <h4>No issue classes matching your criteria.</h4>
                </li>
            ]
            notFound = "not-found"
        }

        var tiles = this.props.tiles ? "tiles clearfix" : ""
        return  <ul className={"issue-class-list " + tiles + " " + notFound}>
                    {issueClassItems}
                </ul>
    }
})

export default IssueClassList
