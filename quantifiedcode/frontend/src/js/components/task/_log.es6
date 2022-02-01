import { render }  from 'react-dom';
import React from "react"
import LoaderMixin from "components/mixins/loader"
import Utils from "utils"
var createReactClass = require('create-react-class');

var TaskLog = createReactClass({

    mixins : [LoaderMixin],

    resources : function(props){
        var data = this.state.data || {}
        return [
            {
                name: 'project',
                endpoint : this.apis.project.getDetails,
                params : [props.data.projectId,{}]
            },
            {
                name: 'taskLog',
                endpoint : this.apis.task.getLog,
                params : [props.data.projectId,props.data.taskId,{from_chr :data.fromChr || 0}],
                mapping : {len : 'len',fromChr : 'from_chr', log : 'task_log'}
            },
            {
                name: 'task',
                endpoint : this.apis.task.getDetails,
                params : [props.data.projectId,props.data.taskId]
            },
        ]
    },

    componentWillMount : function(){
        this.fromChr = undefined
        this.log = ""
        this.updateScroll = true
    },

    afterLoadingSuccess : function(d){
        if (d.len > 0)
            this.updateScroll = true
        this.log = [this.log.slice(0, d.fromChr), d.log].join('')
        d.fromChr = d.fromChr + d.log.length
        if (d.task.status == 'in_progress'){
            var reloadEverything = function(){
                this.reloadResources()
            }.bind(this)
            setTimeout(reloadEverything,5000)
        }
        return d
    },

    getInitialState : function(){
        return {autoScroll : true}
    },

    toggleAutoScroll : function(e){
        this.setState({autoScroll : e.target.checked})
    },

    componentDidUpdate :function(){
        if (this.state.autoScroll && this.updateScroll && this.refs.taskLog){
            this.updateScroll = false
            var node = this.refs.taskLog.getDOMNode()
            $(node).scrollTop($(node)[0].scrollHeight)
        }
    },

    render : function(){
        var data = this.state.data
        var task = data.task

        var progressBar
        if (data.task.status == 'in_progress')
            progressBar = <span><i className="fa fa-spin fa-refresh" />[...]</span>

        return <div>
                <div className="row">
                  <div className="col-xs-12">
                    <pre className="task-log" ref="taskLog">
                        {this.log}
                        {progressBar}
                    </pre>
                    <label><input checked={this.state.autoScroll} onChange={this.toggleAutoScroll} type="checkbox" name="scrollToBottom" /> Automatically scroll to bottom</label>
                  </div>
               </div>
            </div>
    },

})

export default TaskLog
