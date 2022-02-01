import { render }  from 'react-dom';
import React from "react"
import Paginator from "components/generic/paginator"
import Utils from "utils"
import {makeUrl} from "routing"
var createReactClass = require('create-react-class');

var OffsetPaginator = createReactClass({

    displayName: 'OffsetPaginator',

    getDefaultProps: function(){
      return {offset :0,limit : 20}
    },

    render: function(){
      var count = parseInt(this.props.count || 0)
      var offset = parseInt(this.props.offset || 0)
      var limit = parseInt(this.props.limit || 0)

      var nextDisabled = this.props.count !== undefined && (offset + limit >= count)
      var prevDisabled = offset === 0
      var prevHref,nextHref
      if (offset > 0)
        prevHref = makeUrl(this.props.baseUrl,
                                   {limit: limit, offset: Math.max(offset-limit, 0)},
                                   this.props.params)
      if (offset +limit < count)
        nextHref = makeUrl(this.props.baseUrl,
                                   {limit: limit, offset: offset+limit},
                                   this.props.params)

     return <Paginator nextHref={nextHref} prevHref={prevHref} styles={this.props.styles}/>
    }
})

export default OffsetPaginator
