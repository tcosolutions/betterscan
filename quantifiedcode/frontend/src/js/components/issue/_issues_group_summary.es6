import { render }  from 'react-dom';
import React from "react"
import IssueHelpers from "helpers/issue"
import Utils from "utils"
var createReactClass = require('create-react-class');

var IssuesGroupSummary = createReactClass({

    displayName: 'IssuesGroupSummary',

    render: function() {
        var props = this.props,
            state = this.state

        var filesCount = IssueHelpers.countFor(props.issues)[0],
            issuesCount = IssueHelpers.countFor(props.issues)[1]

        return <span className=""></span>
    }

})

export default IssuesGroupSummary
