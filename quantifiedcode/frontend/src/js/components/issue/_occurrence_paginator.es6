import { render }  from 'react-dom';
import React from "react"
import {A} from "routing"
var createReactClass = require('create-react-class');

var OccurrencePaginator = createReactClass({

    render: function() {
        var markers = []

        var start = Math.max(this.props.i-4,0)
        var end = Math.min(this.props.i+4,this.props.len)

        for (var i = start; i < end; i++) {
            if (i == this.props.i)
                markers.push(<li className="number active">{i+1}</li>)
            else
                markers.push(<li className="number" ><A href={this.props.makeUrl(i)}>{i+1}</A></li>)
        }

        return <ul>
                    <li className="leading">{start > 0 ? '...' : ''}</li>
                    {markers}
                    <li className="following">{end < this.props.len ? '...' : '' }</li>
               </ul>
    }
})

export default OccurrencePaginator
