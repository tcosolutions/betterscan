import { render }  from 'react-dom';
import React from "react"
import LoaderMixin from "components/mixins/loader"

var createReactClass = require('create-react-class');

var NotFound = createReactClass({

    displayName: 'NotFoundPage',

    mixins : [LoaderMixin],

    resources : function(props){
        return []
    },

    isInvalidRoute : function() {
      return true
    },

    getErrorMessage : function(){
        return 'The URL you are trying to open does not exist.'
    },

    render : function(){
        return this.showErrorMessage()
    }
})

export default NotFound
