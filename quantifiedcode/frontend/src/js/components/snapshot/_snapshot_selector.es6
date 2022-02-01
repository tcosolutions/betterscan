import { render }  from 'react-dom';
import React from "react"
import Settings from "settings"
var createReactClass = require('create-react-class');

var SnapshotSelector = createReactClass({

    displayName: 'SnapshotSelector',

    render : function(){
        var state = this.state,
            props = this.props

        var snapshotSelectors = Settings.providers['project.snapshot'] || []
        var SnapshotSelectorComponent
        for(var i=0;i < snapshotSelectors.length; i++){
            if (snapshotSelectors[i].source == props.project.source){
                SnapshotSelectorComponent = snapshotSelectors[i].component
                break
            }
        }

        if (SnapshotSelectorComponent){
            return <div><SnapshotSelectorComponent
                                     baseUrl={props.baseUrl}
                                     params={props.params}
                                     project={props.project}
                                     snapshot={props.snapshot} /></div>
        }
        else
            return <div>
                <p className="alert alert-warning">
                    Could not find a snapshot selector class for {props.project.source}.
                </p>
            </div>
    }
})

export default SnapshotSelector
