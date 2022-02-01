import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"

var AutoUpdate = {

    componentDidMount : function(){
        this.setState({intervals : []})
    },

    componentWillUnmount: function() {
        var intervals = this.state.intervals
        for (var i = 0; i < intervals.length; i++) {
            clearInterval(intervals[i])
        }
    },

    autoUpdate : function(func, args, time){
        args.push(this.updateData)
        var call_me = function(){
            func.bind(this)(...args)
        }
        var interval = setInterval(call_me, time)
        this.state.intervals.push(interval)
    },

    updateData : function(data){
        if (!this.isMounted())
            return
        this.setState(data)
    },

}

export default AutoUpdate
