import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import {A, makeUrl} from "routing"
import ProjectApi from "api/project"
import LoaderMixin from "components/mixins/loader"
import ProjectItem from "components/project/_project_item"
var createReactClass = require('create-react-class');

var PublicProjectList = createReactClass({

    displayName: 'PublicProjectList',

    render : function(){
        var projectItems = this.props.projects.map(function (project) {
              return <ProjectItem projectLink={this.props.projectLink} onChange={this.props.onChange} project={project} key={project.pk} />
            }.bind(this))
        if (projectItems.length)
            return  <ul id="public-project-list">
                        {projectItems}
                    </ul>
        else{
            var notFoundMessage
            if (Utils.isLoggedIn())
                notFoundMessage = [<p>Go ahead and add your projects for analysis</p>,
                            <A className="btn btn-primary space-top-20"
                               href={makeUrl("/project/new")}>Add projects</A>]
            else
                notFoundMessage = [<p>Sign up to add your projects.</p>,
                            <A className="btn btn-primary space-top-20"
                                href={makeUrl("/user/signup")}>Sign Up</A>]

            return <div id="public-project-list" className="no-results content-box">
                <div className="head">
                    <i className="fa fa-exclamation-triangle"></i>
                    <h3>No projects found</h3>
                </div>
                <div className="body">
                    {notFoundMessage}
                </div>
            </div>
        }

    }
})

export default PublicProjectList
