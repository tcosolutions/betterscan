import { render }  from 'react-dom';
import ProjectApi from "api/project"
import FormMixin from "components/mixins/form"
import LoaderMixin from "components/mixins/loader"
import TabsMixin from "components/mixins/tabs"
import ToggleSwitch from "components/generic/toggle_switch"
import Helper from "components/generic/helper"
import React from "react"
import FlashMessagesService from "flash_messages"
import Utils from "utils"
import {makeUrl, redirectTo} from "routing"
import Settings from "settings"

var createReactClass = require('create-react-class');

var ProjectForm = createReactClass({

    displayName: 'EditProjectForm',

    mixins : [FormMixin],

    updateData :function(props){
      var d = $.extend({},props.data)
      if (d.tags)
        d.tags = d.tags.join(', ')
      this.setState(d)
    },

    componentWillReceiveProps : function(props){
      this.updateData(props)
    },

    componentWillMount : function(){
      this.flashMessagesService = FlashMessagesService.getInstance()
      this.updateData(this.props)
    },

    getInitialState : function(){
      return {public : false}
    },

    isDirty : function(){
      if (!this.props.project)
        return false
      if ((!this.props.data) && (this.state.name || this.state.description  || this.state.public))
        return true
      if (!this.props.data)
        return false
      return (this.state.description !== undefined && this.props.data.description != this.state.description) ||
        (this.state.name !== undefined && this.props.data.name != this.state.name) ||
        (this.state.public !== undefined && this.props.data.public != this.state.public)
    },

    validateName : function() {
      if (this.state.name.indexOf("/") === -1)
        return true
      return false
    },

    handleSubmit: function(event) {

      if (event)
        event.preventDefault()

      var props = this.props,
        state = this.state

      var formData = {name: this.state.name,
        public : this.state.public,
        description : this.state.description}

      if (this.state.name !== undefined && !this.validateName()) {
        this.addFieldError("name", 'A slash "/" is not allowed within the project name.')
        return
      }

      if (!this.validate(formData))
        return

        this.disable()

        var onSuccess, onError
        onSuccess = function(data){
          this.flashMessagesService.postMessage({
            type: "info",
            description: "Your project has been updated!"
          })
          this.enable()
          if (this.props.onChange)
            this.props.onChange()
        }.bind(this)

        onError = function(xhr,status,e){
          this.parseApiErrorData(xhr.responseJSON)
          this.enable()
        }.bind(this)

        ProjectApi.updateProject(this.props.project.pk,
          formData,
          onSuccess,
          onError
        )

    },

    render: function() {
      var props = this.props,
          state = this.state
      var project = props.project

      var spinner
      if (state.disabled)
        spinner = <i className="fa fa-refres fa-spin" />

      var button = (
        <button className="btn btn-primary pull-left" type="submit"
                disabled={state.disabled || (!this.isDirty()) }>
          {!this.isDirty() ? 'No changes' : 'Update'}
          {spinner}
        </button>
      )

      var sourceSettings = Settings.sourceSettings[Settings.getSource(project)]

      var nameField = (
        <div>
          <div className="form-group">
            <h4><label htmlFor="name">Name</label></h4>
            {this.formatFieldError('name')}
            <input id="name"
                   className="form-control"
                   placeholder="Project name"
                   value={state.name || project.name}
                   onChange={this.setter('name')}
                   disabled={sourceSettings["editNameDisabled"] || false}
            />
          </div>
        </div>
      )

      var descriptionField = (
        <div className="form-group">
          <h4><label htmlFor="description">Description (optional)</label></h4>
          {this.formatFieldError('description')}
                  <textarea id="description"
                            className="form-control"
                            placeholder="A short description of your project."
                            autofocus="true"
                            rows={4}
                            value={state.description || project.description}
                            onChange={this.setter('description')}
                            disabled={sourceSettings["editDescriptionDisabled"] || false}
                  />
        </div>
      )

      var privacyHelp = (
        <Helper>
          <p>
            <strong>Private</strong> projects and their analyses are only visible to yourself and your collaborators.<br/>
            <strong>Public</strong> project on the other hand, will be open to the public.
          </p>
        </Helper>
      )

      var onPublicChange = function(value){
        this.setState({public: value})
      }.bind(this)


      var toggleSwitch

      if (sourceSettings["editPrivacyDisabled"]) {
        toggleSwitch = [
          <ToggleSwitch onText="public" offText="private" on={this.state.public} disabled={true} />,
          " (determined by source settings)"
        ]
      } else {
        toggleSwitch = (
          <ToggleSwitch onText="public" offText="private" on={this.state.public} onChange={onPublicChange} />
        )
      }

      var privacyField = (
        <div className="form-group">
          <h4><label htmlFor="public">Privacy {privacyHelp}</label></h4>
          {this.formatFieldError('public')}
          {toggleSwitch}
        </div>
      )

      return  <div>
        <form ref="form" id="project-form" role="form" onSubmit={this.handleSubmit}>
          <fieldset disabled={this.state.disabled}>
            {this.formatErrorMessage()}
            {nameField}
            {descriptionField}
            {privacyField}
            {button}
          </fieldset>
        </form>
      </div>
    }
})

export default ProjectForm
