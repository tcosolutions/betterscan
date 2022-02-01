import { render }  from 'react-dom';
import React from "react"
var createReactClass = require('create-react-class');

var Row = createReactClass({

  displayName: 'Row',

  render : function(){
    var row = this.props.fields.map(function(field){
      if (field.name !== undefined && field.renderField === undefined)
        return <td>{this.props.datum[field.name]}</td>
      else if (field.render !== undefined)
        return <td>{field.render(this.props.datum)}</td>
      }.bind(this))
    return <tr>{row}</tr>
  }
})

var Header = createReactClass({
  displayName: 'Header',
  render : function(){
    var headers = this.props.fields.map(function(field){
        return <th>{field.title}</th>
      })
    return <tr>{headers}</tr>
  }
})

var Table = createReactClass({

  displayName: 'Table',

  getDefaultProps: function (){
      return {onClick: function(){return false;},data : [],Row : Row, Header : Header}
  },

  render: function() {

    var header = this.props.Header({fields : this.props.fields})

    var rows = this.props.data.map(function(datum){
      return this.props.Row({datum : datum, fields :this.props.fields})
    }.bind(this))

    return <table cellpadding="0" cellspacing="0" border="0" className="table table-striped table-bordered" id="example" width="100%">
          <thead>
            {header}
          </thead>
          <tbody>
            {rows}
          </tbody>
      </table>

  }

})

export default Table
