import React from "react"
import {render}  from 'react-dom';
import Utils from "utils"
import {makeUrl, A} from "routing"
var createReactClass = require('create-react-class');
var ProjectItem = createReactClass({

    displayName: 'ProjectItem',

    getInitialState : function(){
      return {user: undefined}
    },

    render : function(){

      var project = this.props.project

      var leftBadges = []
      var rightBadges = []

      if (project.stats && project.stats.summary && project.stats.summary.issues)
        leftBadges.push(<li><span className="issues">{project.stats.summary.issues} Issues</span></li>)

      if (project.stats !== undefined && project.stats.contributors !== undefined)
        leftBadges.push(<li><span className="contributors"> {project.stats.contributors} Contributors</span></li>)


      return (
        <li key={project.pk} className="element clearfix project" data-project-id={project.pk}>
          <A itemProp="url" href={this.props.projectLink ? this.props.projectLink(project) : makeUrl("/project/" + project.permalink)} className="box-link project-link">
            <div className="head clearfix">
              <h2 itemProp="name" className="pull-left truncate-xs">{this.props.project.name}</h2>
            </div>
            <ul className="meta">
              {leftBadges}
            </ul>
            <p itemProp="description" className="description col-xs-12">{Utils.truncate(this.props.project.description !== undefined ? this.props.project.description : '(no description available)',120)}</p>
            <div className="info clearfix">
              <div className="row">
                <span className="analysis-timestamp col-xs-12 pull-right text-right">
                  {rightBadges}
                </span>
              </div>
            </div>
          </A>
        </li>
      )
    }
})

export default ProjectItem
