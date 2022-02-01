import { render }  from 'react-dom';
import React from "react"
import LoaderMixin from "components/mixins/loader"
import Utils from "utils"
import {makeUrl, A} from "routing"
import Moment from "moment"
var createReactClass = require('create-react-class');

var TaskItem = createReactClass({
    getDefaultProps: function (){
        return {'task' : {'project':{'name': undefined}}}
    },
    render: function() {
        var color = undefined
        if (this.props.task.status == 'succeeded')
            color = 'green'
        else if (this.props.task.status == 'failed')
            color = 'red'
        else
            color = 'grey'
        var duration = function(milliseconds){
            if (!milliseconds)
                return '(undefined)'

            var secs = milliseconds / 1000
            if (secs < 60 * 1000)
                return Math.round(secs).toString()+" seconds"
            if (secs < 3600)
                return Math.round(secs/60).toString()+" minutes, "+Math.round(secs % 60).toString()+" seconds"
            else
                return Math.round(secs/60/60).toString()+" hours, "+Math.round((secs-3600*Math.floor(secs/60/60))/60).toString()+" minutes, "+Math.round(secs % 60).toString()+" seconds"
        }
        var name = undefined
        return <div className={"list-item snapshot-item"+(this.props.odd === true ? ' odd' : '')}>
            <div className={"circle "+color}></div>
            <A href={makeUrl("/project/"+this.props.task.project.pk+"/task/"+this.props.task.pk)}>
                <div className="content">
                    <p className="log">
                        <b>Type</b>: {Utils.capitalizeFirstChar(this.props.task.type)} - <b>Status</b>: <i>{Utils.capitalizeFirstChar(this.props.task.status)}</i>
                    </p>
                    <p className="summary">
                        <ul>
                            <li><b>Created</b>: {this.props.task.created_at}</li>
                            <li><b>Duration</b>: {duration(Moment(this.props.task.updated_at).diff(this.props.task.created_at))}</li>
                        </ul>
                    </p>
                </div>
            </A>
        </div>
    }
})

var TaskList = createReactClass({

    mixins : [LoaderMixin],

    resources : function(props){
        return [
            {
                name : 'tasks',
                endpoint : this.apis.task.getTasks,
                params: [this.props.data.projectId]
            }
        ]
    },

    componentDidMount : function() {
        Utils.trackEvent("Usage", "Task log list viewed")
    },

    render: function() {
        var tasks = this.state.data.tasks.map(function (task) {
              return <TaskItem task={task}></TaskItem>
            })
        if (tasks.length == 0)
            return <p className="alert alert-info">Seems there are no tasks to show for this project.</p>
        return <div className="snapshot-list">{tasks}</div>
    }
})

export default TaskList
