import React from "react"
import Utils from "utils"
import {A, makeUrl} from "routing"

var BranchSelector = React.createClass({
    displayName: 'BranchSelector',

    propTypes: {
        //all available branches
        branches: React.PropTypes.arrayOf(React.PropTypes.shape({
          name: React.PropTypes.string.isRequired
        }).isRequired).isRequired,
        //the name of the currently selected branch
        branch: React.PropTypes.string,
        baseUrl: React.PropTypes.string.isRequired,
        params: React.PropTypes.object.isRequired,
    },

    compareBranches: function(a,b) {
        //toUpperCase is a hack in order to sort the elements alphabetically
        //and not by Unicode code point
        if (a.name.toUpperCase() < b.name.toUpperCase()) {
            return -1;
        }
        if (a.name.toUpperCase() > b.name.toUpperCase()) {
            return 1;
        }
        return 0;
    },

    render : function(){
        var branchOptions = this.props.branches.sort(this.compareBranches).map(function (branch) {
              return <li key={branch.name}><A href={makeUrl(this.props.baseUrl,{branch: branch.name},this.props.params,['limit','offset'])}>{branch.name}</A></li>;
            }.bind(this));

        return  <span>
                    <button type="button" className="selector branch dropdown-toggle" data-toggle="dropdown">
                        <span className="text">{this.props.branch ? this.props.branch : '(no branch selected)'}</span>
                        <span className="sr-only">Toggle Dropdown</span>
                    </button>
                    {branchOptions.length ? <ul className="dropdown-menu selector-dropdown" role="menu">{branchOptions}</ul> : undefined}
                </span>;
    }
});

export default BranchSelector
