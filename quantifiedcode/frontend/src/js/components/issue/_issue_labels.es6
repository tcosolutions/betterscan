import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"

import $ from "jquery"
var createReactClass = require('create-react-class');
var IssueLabels = createReactClass({

    displayName: 'IssueLabels',

    render : function() {
        $('[data-toggle="tooltip"]').tooltip();
        var categoriesLabels = this.props.issue.categories.map(function(category){return [<li key={category} className={"label label-"+category} data-toggle="tooltip" data-placement="top" title={Utils.capitalizeFirstChar(category)}></li>];}.bind(this));
        return  <ul className="cat-list pull-right clearfix">
            {categoriesLabels}
        </ul>;
    }

});

export default IssueLabels
