import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import {makeUrl, A} from "routing"
import LoaderMixin from "components/mixins/loader"
import Settings from "settings"
import ProjectApi from "api/project"
import UserApi from "api/user"
import FlashMessagesService from "flash_messages"
var createReactClass = require('create-react-class');

var AccessManagement = createReactClass({

    displayName: 'AccessManagement',

    mixins : [LoaderMixin],

    resources : function(props){
        return [{
            name : 'roles',
            endpoint : ProjectApi.getRoles,
            params : [props.project.pk],
            mapping : {roles : 'roles'},
        }]
    },

    getInitialState : function(){
        return {users : [],
                foundUsers : null,
                queryFieldId : Math.random().toString(36).substring(7)}
    },

    componentWillMount : function(){
        this.flashMessagesService = FlashMessagesService.getInstance()
    },

    changeQuery : function(e){
        this.setState({query : e.target.value})
        this.searchForUsers(e.target.value)
    },

    onUserError : function(xhr,data,e){
        this.setState({users: []})
    },

    searchForUsers : function(name){
        if (name === '')
            this.setState({users : []})
        else{
            UserApi.getUsers({name : name, ignore_self : true},this.updateUsers,this.onUserError)
        }
    },

    updateUsers : function(data){
        this.setState({users : data.users})
        if (data.users.length > 0)
            this.setState({foundUsers : true})
        else
            this.setState({foundUsers : false})
    },

    render: function(){

        var props = this.props,
            state = this.state,
            data = state.data,
            activeRole = props.params.role || 'owner'

        var roleTabs = ['owner','admin','collaborator'].map(function(role){
            return <li className={role == activeRole ? "active" : ''}><A href={makeUrl(props.baseUrl,{role : role},props.params)}>{Utils.capitalizeFirstChar(role)}</A></li>
        }.bind(this))

        var roleMembers = <p>No users are assigned to this role.</p>

        var roles = data.roles.filter(function(role){return role.role == activeRole ? true : false;}.bind(this)).map(function(role){

            var removeUserRole = function(e){
                e.preventDefault()
                ProjectApi.removeRole(
                    props.project.pk,
                    role.pk,
                    function(data){if (this.props.onChange)
                                      this.props.onChange()
                                   this.reloadResources();}.bind(this),
                    function(xhr){
                        this.flashMessagesService.postMessage({
                            type: "danger",
                            description: xhr.responseJSON.message
                        })
                    }.bind(this)
                )
            }.bind(this)

            if (role.user.name !== undefined)
                return <li>{role.user.name} <A className="remove pull-right" onClick={removeUserRole}><i className="fa fa-trash-o" /> Remove</A></li>
        }.bind(this))

        if (roles.length)
            roleMembers = <ul className="list members results">
                    {roles}
                </ul>

        var userResults = ''
        if (state.foundUsers !== null) {
            if (state.users.length > 0)
                userResults = state.users.map(function(user){
                    var addToRole = function(e){
                        e.preventDefault()
                        ProjectApi.addRole(
                            props.project.pk,
                            activeRole,
                            user.pk,
                            function(data){if (this.props.onChange)
                                              this.props.onChange()
                                           this.reloadResources();}.bind(this),
                            function(xhr){
                                this.flashMessagesService.postMessage({
                                    type: "danger",
                                    description: xhr.responseJSON.message
                                })
                            }.bind(this)
                        )
                    }.bind(this)
                    if (user.name !== undefined)
                        return <li><A onClick={addToRole}>{user.name}</A></li>
                }.bind(this))
            else if (state.query)
                userResults = <li className="no-result">No users found.</li>
        }

        var searchForm = <form className="form" role="form" onSubmit={function(e){e.preventDefault();} }>
                <h4>Add an existing user</h4>
                <input id={"query"+state.queryFieldId}
                       className="form-control"
                       value={state.query}
                       onChange={this.changeQuery}
                       type="query"
                       ref="query"
                       placeholder="Type user name..." />
            </form>

        var results =  <div>
                        <ul className="add user results">
                            {userResults}
                        </ul>
                    </div>

        var roleExplanation

        switch(activeRole){
            case 'owner':roleExplanation = 'Owners can do everything.';break
            case 'admin':roleExplanation = 'Administrators can change project settings.';break
            case 'collaborator': roleExplanation = 'Collaborators can view project settings and analysis results, including code.';break
        }

        return <div className="content-box project-roles">
                    <div className="head">
                        <h3>Access management</h3>
                    </div>
                    <div className="body clearfix">
                        <div className="row">
                            <div className="col-xs-12">
                                <ul className="nav nav-tabs space-bottom-20">
                                    {roleTabs}
                                </ul>
                                <div className="tab-content">
                                    <div className="row">
                                        <div className="col-xs-12">
                                            <p><i className="fa fa-info-circle" /> {roleExplanation}</p>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-xs-12 col-sm-6">
                                            <h4>Members of this role</h4>
                                            {roleMembers}
                                            <hr className="visible-xs"/>
                                        </div>
                                        <div className="col-xs-12 col-sm-6">
                                            {searchForm}
                                            {results}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    }

})

export default AccessManagement
