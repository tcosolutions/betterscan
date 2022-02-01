import { render }  from 'react-dom';
import React from "react"
import LoaderMixin from "components/mixins/loader"
import TaskLog from "components/task/_log"
var createReactClass = require('create-react-class');

var TaskDetails = createReactClass({

    mixins : [LoaderMixin],

    resources : function(props){
        return [
            {
                name: 'project',
                endpoint : this.apis.project.getDetails,
                params : [this.props.data.projectId,{}]
            },
            {
                name: 'task',
                endpoint : this.apis.task.getDetails,
                params : [this.props.data.projectId,this.props.data.taskId]
            }
        ]
    },

    render : function(){
        var data = this.state.data
        var task = data.task

        return <div>
                <div className="row">
                  <div className="col-xs-12">
                    <h4><b>Type</b>: {task.type} - <i>{task.status}</i></h4>
                    <div className="tab-content">
                        <TaskLog params={this.props.params}
                                 onChange={this.reloadResources}
                                 baseUrl={this.props.baseUrl}
                                 data={this.props.data} />
                    </div>
                  </div>
                </div>
            </div>
    },

})

export default TaskDetails
