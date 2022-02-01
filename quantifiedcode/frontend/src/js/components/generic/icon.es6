import { render }  from 'react-dom';
import React from "react"
var createReactClass = require('create-react-class');
    var Icon = createReactClass({

    displayName: 'Icon',

    render : function(){
      return <i className={"octicon octicon-" + this.props.name} />
    }
})

export default Icon
