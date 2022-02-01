import React from "react"
import Utils from "utils"
import {makeUrl, A} from "routing"
import CommitSelector from "./_commit_selector"

var GitSnapshotSelector = React.createClass({

    displayName: 'GitSnapshotSelector',

    render : function(){
        var state = this.state,
            props = this.props
        return <CommitSelector
                baseUrl={props.baseUrl}
                params={props.params}
                project={props.project}
                snapshot={props.snapshot}
                branch={props.params.branch || (props.snapshot !== undefined ? props.snapshot.branch.name : '(no branch defined)')}
                deepLink={props.deepLink} />
    }

})

export default GitSnapshotSelector
