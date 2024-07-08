import ProjectApi from "git/api/project"
import FormMixin from "components/mixins/form"
import LoaderMixin from "components/mixins/loader"
import TabsMixin from "components/mixins/tabs"
import ToggleSwitch from "components/generic/toggle_switch"
import Helper from "components/generic/helper"
import React from "react"
import FlashMessagesService from "flash_messages"
import {makeUrl, redirectTo} from "routing"
import Settings from "settings"

var ProjectForm = React.createClass({

    displayName: 'NewProjectForm',

    mixins : [FormMixin],

    updateData :function(props){
        var d = $.extend({},props.data)
        if (d.tags)
            d.tags = d.tags.join(', ');
        this.setState(d);
    },

    componentWillReceiveProps : function(props){
        this.updateData(props);
    },

    componentWillMount : function(){
        this.flashMessagesService = FlashMessagesService.getInstance();
        this.updateData(this.props);
    },

    getInitialState : function(){
        return {public : false};
    },

    isDirty : function(){
        if (!this.props.data)
            return false;
        return (this.state.description !== undefined && this.props.data.description != this.state.description) ||
               (this.state.name !== undefined && this.props.data.name != this.state.name) ||
               (this.state.url !== undefined && this.props.data.url != this.state.url) ||
               (this.state.public !== undefined && this.props.data.public != this.state.public);
    },

    validateName : function() {
        if (this.state.name.indexOf("/") === -1)
            return true;
        return false;
    },

    handleSubmit: function(event) {

        if (event)
            event.preventDefault();

        var props = this.props,
            state = this.state;

        var input_url = this.state.url;
        input_url = input_url.replace('ssh://','');
        if(input_url.indexOf('@') !== -1)
        {
          var git_url = input_url.replace(':','/');
          var git_str = "ssh://";
          var git_url = git_str.concat(git_url);
          input_url = git_url;
        }


        var formData = {name: this.state.name,
                        url : input_url,
                        public : this.state.public,
                        description : this.state.description};


        if (this.state.name !== undefined && !this.validateName()) {
            this.addFieldError("name", 'A slash "/" is not allowed within the project name.');
            return;
        }

        if (!this.validate(formData))
            return;

        this.disable();

        var onSuccess, onError;
        onSuccess = function(data){
            this.flashMessagesService.postMessage({
                type: "info",
                description: "Your project has been created and is currently being analyzed!"
            });
            redirectTo(makeUrl("/project/"+data.project.permalink));
        }.bind(this);

        onError = function(xhr,status,e){
            if (!this.isMounted())
                return;
            var data = xhr.responseJSON;
            if(data.message) {
                this.flashMessagesService.postMessage({
                    type: "danger",
                    description: data.message});
            }
            this.parseApiErrorData(data);
            this.enable();
        }.bind(this);

        ProjectApi.create(
            formData,
            onSuccess,
            onError
        );
    },

    render: function() {
        var props = this.props,
            state = this.state,
            parent = this,
            projectName;

        var spinner;
        if (state.disabled)
            spinner = <i className="fa fa-refres fa-spin" />
        var button = (
          <button className="btn btn-primary"
                  type="submit"
                  disabled={state.disabled}>
            Continue
            {spinner}
          </button>
        );


       var urlHelp = <Helper>
            <p>
                More information on adding Projects (Public/Private) in <a href="https://github.com/tcosolutions/betterscan-ce/wiki">Wiki</a>
            </p>
        </Helper>;



        var newFields;

        var warning;
        var urlCheckers = Settings.providers['project.new.urlChecker'] || [];

        urlCheckers.forEach(function (checker) {
          if (checker.regex.test(state.url)) {
            warning = checker.getMessage(parent);
          }
        });

        newFields = <div>
                      <div className="form-group">
                        <h4><label htmlFor="name">Name</label></h4>
                        {this.formatFieldError('name')}
                        <input id="name"
                            className="form-control"
                            placeholder="Project name"
                            value={this.state.name}
                            onChange={this.setter('name')} />
                      </div><div className="form-group">
                        <h4><label htmlFor="url">URL {urlHelp}</label></h4>
                        {this.formatFieldError('url')}
                        <input id="url"
                            className="form-control"
                            placeholder="Git Repo - Clone with HTTPS (i.e https://github.com/user/project) or SSH (ssh://git@github.com/user_org/repo.git)"
                            value={this.state.url}
                            onChange={this.setter('url')} />
                        {warning}
                      </div>
                    </div>;

        var privacyHelp = <Helper>
            <p>
                <strong>Private</strong> projects and their analyses are only visible to yourself and your collaborators.<br/>
                <strong>Public</strong> project on the other hand, will be open to the public.
            </p>
        </Helper>;



        var onPublicChange = function(value){
            this.setState({public : value});
        }.bind(this);

        var toggleSwitch = <ToggleSwitch onText="public"
                                         offText="private"
                                         on={this.state.public}
                                         onChange={onPublicChange}/>;

        return  <div>
            <form ref="form" id="project-form" role="form" onSubmit={this.handleSubmit}>
                <fieldset disabled={this.state.disabled}>
                    {this.formatErrorMessage()}
                    <div className="form-group">
                        <h4><label htmlFor="public">Privacy {privacyHelp}</label></h4>
                        {this.formatFieldError('public')}
                        {toggleSwitch}
                    </div>
                    {newFields}
                    <div className="form-group">
                        <h4><label htmlFor="description">Description (optional)</label></h4>
                        {this.formatFieldError('description')}
                        <textarea id="description"
                            className="form-control"
                            placeholder="A short description of your project."
                            autofocus="true"
                            rows={4}
                            value={this.state.description}
                            onChange={this.setter('description')} />
                    </div>
                    {button}
                </fieldset>
            </form>
        </div>;
    }
});

export default ProjectForm
