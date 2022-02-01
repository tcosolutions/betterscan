/**
 * @jsx React.DOM
 */

define([
  "react",
  "js/flash_messages",
  "js/components/mixins/form",
  "js/utils",
  "../api/slack"
], function (
  React,
  FlashMessagesService,
  FormMixin,
  Utils,
  SlackAPI
) {
  "use strict";

  var UserSettings = React.createClass({
    displayName: "SlackSettings",

    mixins: [FormMixin],

    statics: {
      getTitle: function () {return ['Slack ', <i className="fa fa-slack" />];}
    },

    fields: {
      webhook: {
        name: "Slack WebHook URL",
        required: false,
        validator: function (value, name, data) {
          var regex = /https:\/\/hooks.slack.com\/services\/T\w{8}\/B\w{8}\/\w+$/;
          // Remove trailing slash
          if (value && value.substr(-1) === "/") {
            value = value.substr(0, value.length - 1);
          }
          // Check if we got a valid slack webhook url
          if (value != "" && !(value.match(regex)))
            throw {message: "Please enter a valid valid Slack WebHook URL. " +
                            "Format: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXX"};
        }
      }
    },

    getInitialState: function () {
      var user = this.props.user || {};
      return {
        webhook: user.slack && user.slack.webhook || ""
      };
    },

    componentWillMount: function () {
      this.flashMessagesService = FlashMessagesService.getInstance();
    },

    componentDidMount: function () {
      Utils.trackEvent("Usage", "Slack WebHook form viewed");
    },

    render: function () {
      var state = this.state;

      return <div className="content-box">
        <div className="head">
          <h3>Slack integration</h3>
        </div>
        <div className="body clearfix">
          <p className="form-info">Add Slack WebHook to receive <A href={Utils.makeUrl("/settings?tab=notifications")}>immediate
            notifications</A> via Slack, instead of email.</p>
          <form onSubmit={this.onSubmit}>
            <fieldset disabled={this.state.disabled}>
              { this.formatErrorMessage() }
              <input type="webhook"
                     onChange={this.setter('webhook')}
                     value={state.webhook}
                     id="webhook"
                     className="form-control"
                     placeholder="Slack WebHook URL"
                     autofocus/>
              {this.formatFieldError('webhook')}
              <button className="btn btn-md btn-primary" type="submit">Update</button>
            </fieldset>
          </form>
        </div>
      </div>;
    },

    onSubmit: function (e) {
      e.preventDefault();
      var data = {
        webhook: this.state.webhook.trim()
      };

      if (!this.validate(data))
        return;

      var onSuccess = function (data) {
        this.enable();
        this.props.onChange();
        this.flashMessagesService.postMessage({
          type : "info",
          description : "Webhook successfully updated."
        });
      }.bind(this);

      var onError = function (xhr, status, e) {
        this.enable();
        this.parseApiErrorData(xhr.responseJSON);
      }.bind(this);

      SlackAPI.changeWebHook(data, onSuccess, onError);
      this.disable();
    }
  });

  return UserSettings;
});
