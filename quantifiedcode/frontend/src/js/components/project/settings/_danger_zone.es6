import { render }  from 'react-dom';
import ProjectApi from "api/project"
import React from "react"
import Modal from "components/generic/modal"
import Utils from "utils"
import {makeUrl, redirectTo, A} from "routing"
var createReactClass = require('create-react-class');

var DangerZone = createReactClass({

    displayName: 'DangerZone',

    componentDidMount : function() {
        Utils.trackEvent("Usage", "PS: Project dangerzone viewed")
    },

    deleteProject : function(e)
    {
        e.preventDefault()
        var onSuccess = function(data){
            Utils.trackEvent('Usage', 'Project deleted')
            this.setState({deleted : true})
            setTimeout(function(){redirectTo(makeUrl("/projects"));},2000)
        }.bind(this)

        ProjectApi.deleteProject(this.props.project.pk,onSuccess)
        this.setState({deleting:true})
    },

    resetProject : function(e)
    {
        e.preventDefault()
        var onSuccess = function(data){
            Utils.trackEvent('Usage', 'Project resetted')
            this.setState({resetting : false})
            this.refs.resetProjectModal.close()
            this.props.onChange()
        }.bind(this)

        ProjectApi.reset(this.props.project.pk,onSuccess)
        this.setState({resetting:true})
    },

    confirmDeleteProject : function(e)
    {
        e.preventDefault()
        this.refs.deleteProjectModal.open()
    },

    confirmResetProject : function(e)
    {
        e.preventDefault()
        this.refs.resetProjectModal.open()
    },
    handleCancelDelete: function(e) {
        e.preventDefault()
        this.refs.deleteProjectModal.close()
    },

    handleCancelReset: function(e) {
        e.preventDefault()
        this.refs.resetProjectModal.close()
    },

    getInitialState : function(){
        return {deleting : false,resetting : false}
    },

    render : function(){
    var content = <p>Do you really want to delete this project? This action cannot be undone!</p>

    if (this.state.deleted)
        content = <p>Deletion successful! You will be redirected to the Projects list in a second...</p>
    var deleteProjectModal = <Modal
        ref="deleteProjectModal"
        confirm={["Delete Project ",this.state.deleting ? React.DOM.i({className:"fa fa-refresh fa-spin"},'') : undefined]}
        cancel="Cancel"
        disabled={this.state.deleting}
        onCancel={this.handleCancelDelete}
        onConfirm={this.deleteProject}
        title="Delete Project">
            {content}
      </Modal>

    var resetProjectModal = <Modal
        ref="resetProjectModal"
        confirm={["Reset Project ",this.state.resetting ? React.DOM.i({className:"fa fa-refresh fa-spin"},'') : undefined]}
        cancel="Cancel"
        disabled={this.state.resetting}
        onCancel={this.handleCancelReset}
        onConfirm={this.resetProject}
        title="Reset Project">
            <p>Do you really want to reset the analysis data of this project?</p>
      </Modal>

      var resetContent = [<p>This action will erase all analysis data associated to your project. Use this if you want to re-analyze a project from scratch.</p>,
          <A className="pull-right btn btn-warning"
             onClick={this.confirmResetProject}>
                 <i className="fa fa-backward" /> Reset project
          </A>]

      if (this.props.project.reset)
        resetContent = <p className="alert alert-info">The project is scheduled for a reset.</p>

      return <div className="content-box">
                                {deleteProjectModal}
                                {resetProjectModal}
                                <div className="head">
                                    <h3>Danger zone</h3>
                                </div>
                                <div className="body clearfix">
                                    <div className="row">
                                        <div className="col-xs-12">

                                            <div className="panel panel-default">
                                              <div className="panel-heading">Reset analysis data</div>
                                              <div className="panel-body">
                                                  {resetContent}
                                              </div>
                                            </div>

                                            <div className="panel panel-default">
                                              <div className="panel-heading">Delete project</div>
                                              <div className="panel-body">
                                                  <p><strong>Warning:</strong> This action deletes your project from your Scanner account. This cannot be undone.<br/>
                                                  <i>Your Git(hub) repos won&#39;t be deleted.</i></p>
                                                  <A className="pull-right btn btn-danger"
                                                     onClick={this.confirmDeleteProject}>
                                                         <i className="fa fa-trash" /> Delete project
                                                  </A>
                                              </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
    }

})

export default DangerZone
