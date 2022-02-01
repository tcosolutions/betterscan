import { render }  from 'react-dom';
import React from "react"
import Settings from "settings"
import IssueClassApi from "api/issue_class"
import ProjectForm from "components/project/_edit_form"
import Helper from "components/generic/helper"
import Utils from "utils"
import {A} from "routing"
var createReactClass = require('create-react-class');

var TagItem = createReactClass({

    removeTag : function(e){
        e.preventDefault()
        if (this.props.removeTag !== undefined)
            return this.props.removeTag(this.props.tag)
    },

    render : function(){

        var params = {}

        return <span className="tag">{this.props.tag} <A onClick={this.removeTag}><i className="fa fa-times" /></A></span>
    }
})

var TagList = createReactClass({

    render : function(){

        var params = {}

        var tagItems = undefined
        if (this.props.tags !== undefined && Object.keys(this.props.tags).length > 0) {
            tagItems = this.props.tags.map(function(tag){
                    return [<TagItem tag={tag}
                                    data={this.props.data}
                                    baseUrl={this.props.baseUrl}
                                    params={this.props.params}
                                    removeTag={this.props.removeTag}/>,' ']}.bind(this))
        }
        else
            tagItems = <span className="label label-info">(no tags)</span>

        return <div className="tags">
                    {tagItems}
                </div>
    }
})

var AddTag = createReactClass({

    getInitialState : function(){
        return {query : '',tags : [],queryFieldId : Math.random().toString(36).substring(7)}
    },

    changeQuery : function(e){
        this.setState({query : e.target.value})
        this.searchForTags(e.target.value)
    },

    searchForTags : function(name){
        if (name == '')
            this.setState({tags : []})
        else
            IssueClassApi.getTags({name : name},this.updateTags,this.onError)
    },

    updateTags : function(data){
        this.setState({tags : data.tags})
    },

    render : function(){

        var results = this.state.tags.map(function(tag){
            var addTag = function(e){
                e.preventDefault()
                this.props.addTag(tag)
            }.bind(this)
            return <li><A onClick={addTag}>{tag}</A></li>
        }.bind(this))

        var searchForm = <form className="filter-form" role="form" onSubmit={function(e){e.preventDefault();} }>
                <input id={"query"+this.state.queryFieldId}
                       className="filter form-control"
                       value={this.state.query}
                       onChange={this.changeQuery}
                       type="query"
                       ref="query"
                       placeholder="Search for tags to add..." />
            </form>

        return <div className="tags">
                {searchForm}
            <ul className="list tag results">
                {results}
            </ul>
        </div>
        return <div>
                {searchForm}
            </div>
    }
})

var Basics =createReactClass({

    displayName: 'Basics',

    componentDidMount : function() {
        Utils.trackEvent("Usage", "PS: Basic project settings viewed")
    },

    addTag : function(name){
        var onSuccess = function(data){
            this.props.onChange()
        }.bind(this)
        IssueClassApi.addTag(this.props.project.pk,{name : name},onSuccess,onSuccess)
    },

    removeTag : function(name){
        var onSuccess = function(data){
            this.props.onChange()
        }.bind(this)

        IssueClassApi.removeTag(this.props.project.pk,{name : name},onSuccess,onSuccess)
    },

    render: function() {
        var data = {
            description : this.props.project.description || '',
            url : this.props.project.url || '',
            public : this.props.project.public || false,
        }

        var tagsHelp = <Helper>
            <p>
                Adding tags to your project allows us to select the appropriate issue classes for it.
            </p>
            <p>
                For example, if you add a <span className="tag">django-1.5</span> tag,
                we will automatically add issue classes for Django 1.5 as we add them to our platform.
                Like this, you can be sure that you will always use the latest and most relevant issue
                classes for your project.
            </p>
            <p>
                To add tags, type a name into the search bar below, and we will show you tags
                that have been defined for issue classes.
            </p>
        </Helper>

        return <div className="content-box">
            <div className="head">
                <h3>Basics</h3>
            </div>
            <div className="body">
                <div className="row">
                    <div className="col-xs-12">
                        <h4>Tags {tagsHelp}</h4>
                        <AddTag project={this.props.project}
                                addTag={this.addTag}
                                params={this.props.params} />
                        <TagList project={this.props.project}
                                 tags={this.props.project.tags || []}
                                 removeTag={this.removeTag}
                                 params={this.props.params}/>
                        <ProjectForm project={this.props.project}
                                     data={data}
                                     baseUrl={this.props.baseUrl}
                                     onChange={this.props.onChange}
                                     params={this.props.params} />
                    </div>
                </div>
            </div>
        </div>
    }
})

export default Basics
