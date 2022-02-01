import { render }  from 'react-dom';
import React from "react"
import $ from "jquery"
import Bootstrap from "bootstrap"
var createReactClass = require('create-react-class');


var BootstrapModal = createReactClass({
  // The following two methods are the only places we need to
  // integrate with Bootstrap or jQuery!
  displayName: 'BootstrapModal',

  close: function() {
    this.setState({hidden : true})
  },

  open: function() {
    this.setState({hidden : false})
  },

  getInitialState : function(){
    return {hidden : this.props.hidden !== undefined ? this.props.hidden : true}
  },

  getDefaultProps : function(){
    return {closable : true,disabled : false}
  },

  componentWillReceiveProps : function(props){
    if (props.hidden && props.hidden != this.state.hidden)
        this.setState({hidden : props.hidden})
  },

  render: function() {
    if (this.state.hidden)
        return <div ref="modal"/>

    var confirmButton
    var cancelButton

    if (this.props.confirm) {
      confirmButton = (
        <button
          onClick={this.handleConfirm}
          disabled={this.props.disabled}
          className="btn btn-primary">
          {this.props.confirm}
        </button>
      )
    }

    var closeButton

    if (this.props.closable){
      closeButton = <button
        type="button"
        className="close"
        disabled={this.props.disabled}
        onClick={this.handleCancel}>
          &times;
      </button>
    }

    if (this.props.cancel) {
      cancelButton = (
        <button className="btn" disabled={this.props.disabled} onClick={this.handleCancel}>
          {this.props.cancel}
        </button>
      )
    }

    var footer
    var buttons = []
    if (this.props.onCancel)
        buttons.push(cancelButton)
    if (this.props.onConfirm)
        buttons.push(confirmButton)
    if (this.props.onCancel || this.props.onConfirm) {
      footer = <div className="modal-footer">
        {buttons}
      </div>
    }
    var content

    if (this.props.getContent)
        content = this.props.getContent()
    else
        content = this.props.children

    return (
      <div className="modal show" ref="modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              {closeButton}
              <h3>{this.props.title}</h3>
            </div>
            <div className="modal-body">
                {content}
            </div>
            {footer}
          </div>
        </div>
        <div className="modal-backdrop in" onClick={this.props.closable ? this.handleCancel : function(e){e.preventDefault();}}></div>
      </div>
    )
  },

  handleCancel: function(e) {
    if (this.props.onCancel)
      this.props.onCancel(e)
    e.preventDefault()
    this.close()
  },

  handleConfirm: function(e) {
    if (this.props.onConfirm)
      this.props.onConfirm(e)
    e.preventDefault()
  }
})

export default BootstrapModal
