import React from "react"
import {render} from "react-dom"
import Utils from "utils"
import {A} from "routing"
var createReactClass = require('create-react-class');
var ToggleSwitch = createReactClass({

    displayName: 'ToggleSwitch',

    getDefaultProps : function(){
      return {on: true, onText: 'ON', offText: 'OFF', size: '', disabled: false}
    },

    getInitialState : function(){
      return {on: this.props.on !== undefined ? this.props.on : false}
    },

    componentWillReceiveProps : function(props){
      if (props.on !== undefined && props.on != this.state.on)
        this.setState({on : props.on})
    },

    onClick : function(e){
        if(!this.props.disabled) {
            e.preventDefault()
            this.setState({on : !this.state.on })
            if (this.props.onChange !== undefined)
                this.props.onChange(!this.state.on)
        }
    },

    render : function(){
        return <div className="btn-group" role="group">
          <A onClick={this.onClick}>
              <button key="off" type="button" disabled={this.props.disabled}
                      className={"btn btn-default "+this.props.size+(this.state.on == true? ' btn-primary' : '')}>
                      {(typeof this.props.onText === "string" || this.props.onText instanceof String ? Utils.capitalizeFirstChar(this.props.onText) : this.props.onText)}
              </button>
              <button key="on" type="button" disabled={this.props.disabled}
                      className={"btn btn-default "+this.props.size+(this.state.on == false ? ' btn-danger' : '')}>
                      {(typeof this.props.offText === "string" || this.props.offText instanceof String ? Utils.capitalizeFirstChar(this.props.offText) : this.props.offText)}
              </button>
          </A>
        </div>
    }
})

export default ToggleSwitch
