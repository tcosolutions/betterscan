import { render }  from 'react-dom';
import React from "react"
import {A} from "routing"
var createReactClass = require('create-react-class');

var Helper = createReactClass({
  displayName: 'Helper',

  close: function() {
    this.setState({hidden : true})
  },

  open: function() {
    this.setState({hidden : false})
  },

  toggleState : function(e){
    e.preventDefault()
    this.setState({hidden : !this.state.hidden})
  },

  getInitialState : function(){
    return {hidden :true}
  },

  render: function(){
    var marker = <A onClick={this.toggleState} title="click for more information about this field"><i className="fa fa-question-circle" /></A>
    if (this.state.hidden) {
        return marker
    } else {
        return <span>{marker}<div className="space-top-10 alert alert-info helper">{this.props.children}</div></span>
    }
  }

})

export default Helper
