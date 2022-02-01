import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import IssueClassList from "components/issue_class/_list"
import {A, makeUrl} from "routing"
var createReactClass = require('create-react-class');

var IssueClassesSettings = createReactClass({

    render : function(){

        var issueClassList = <IssueClassList baseUrl={this.props.baseUrl}
                                             params={this.props.params}
                                             simple={false}
                                             compact={true}
                                             tiles={false}
                                             withTitle
                                             onChange={this.reloadResources}
                                             data={this.props.data}
                                             project={this.props.project} />

        return issueClassList
    }
})

export default IssueClassesSettings
