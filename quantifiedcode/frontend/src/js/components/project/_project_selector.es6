import { render }  from 'react-dom';
import LoaderMixin from "components/mixins/loader"
import React from "react"
import Utils from "utils"
import {A} from "routing"
var createReactClass = require('create-react-class');

var ProjectSelector = createReactClass({

    mixins : [LoaderMixin],

    displayName: 'ProjectSelector',

    inlineComponent : true,

    getDefaultProps : function(){
        return {selectText : '(select a project)'}
    },

    resources : function(props){
        var params = {}
        return [{
                name : 'projects',
                endpoint : this.apis.project.getUserProjects,
                params : [params],
                nonBlocking : true,
                mapping : {
                    projects : 'projects',
                    count : 'count'
                }
            }]
    },

    render : function(){

        var setProject = function(project,e){
            e.preventDefault()
            this.setState({activeProject : project})
            if (this.props.onChange)
                this.props.onChange(project)
        }.bind(this)

        var projectItems = []
        var activeProject
        var data = this.state.data
        var selectText = '(please wait, loading...)'

        if (data.projects){
            projectItems = data.projects.map(function(project){
                return <li key={project.name}>
                            <A onClick={setProject.bind(this,project)}>
                            {project.name}
                            </A>
                       </li>
            }.bind(this))

            for(var i in data.projects){
                var project = data.projects[i]
                if (project.pk == this.props.params.projectId)
                    activeProject = project
            }
            selectText = this.props.selectText
        }


        return <div className="owner selector-inline"  style={{display:'inline', marginBottom: 0}}>
            <button type="button"
                className="btn btn-default dropdown-toggle space-right-10"
                data-toggle="dropdown"
                disabled={this.props.disabled}
                id="projectSelector"
                aria-expanded="true">
                <span className="text">{activeProject !== undefined ?
                                            activeProject.name :
                                            selectText}{this.props.extraText}</span>
                <span className="sr-only">Toggle Dropdown</span> &nbsp
                <b className="caret" />
            </button>
            <ul className="dropdown-menu"
                role="menu"
                aria-labelledby="projectSelector">
                {projectItems}
            </ul>
        </div>

    },

})

export default ProjectSelector
