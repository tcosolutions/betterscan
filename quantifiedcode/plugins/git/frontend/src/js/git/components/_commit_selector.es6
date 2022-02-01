import React from "react"
import Utils from "utils"
import {redirectTo, makeUrl, A} from "routing"
import SnapshotListComponent from "./_commits"
import Modal from "components/generic/modal"
import BranchSelector from "./_branch_selector"
import Moment from "moment"

var CommitSelector = React.createClass({

    displayName: 'CommitSelector',

    propTypes: {
        //the currently displayed snapshot
        snapshot: React.PropTypes.any,
        //the currently selected branch
        branch:  React.PropTypes.string,
        //the project
        project: React.PropTypes.shape({
          pk: React.PropTypes.string,
          branches: React.PropTypes.any,
        }).isRequired,
        baseUrl: React.PropTypes.string.isRequired,
        params: React.PropTypes.object.isRequired,
        //a link which will be appended to all generated link.
        //neccessary for example in order to link visualizations, etc. directly
        deepLink: React.PropTypes.string,
    },

    render : function(){
        var commitModal;
        var commitSelector;

        if (this.props.snapshot) {
            commitModal = <Modal ref="commitModal"
                            title={
                                <div>
                                  <span>Analyzed commits</span>
                                  <div style={{display:"block",fontSize:"14px",fontWeight: "bolder",marginTop:"10px"}} > {this.props.branch}</div>
                                </div>
                            }>
                              <SnapshotListComponent
                                  onClick={this.closeModal}
                                  branch={this.props.branch}
                                  projectId={this.props.project.pk}
                                  baseUrl={this.props.baseUrl}
                                  params={this.props.params}
                                  deepLink={this.props.deepLink} />
                          </Modal>;

            var date_str = Moment.unix(this.props.snapshot.git_snapshot.committer_date_ts).calendar(null, {
                              sameDay: '[Today] hh:mm A',
                              lastDay: '[Yesterday] hh:mm A',
                              lastWeek: 'MM/DD/YYYY hh:mm A',
                              sameElse : 'MM/DD/YYYY hh:mm A'
                            });
            commitSelector = <A className="selector commit dropdown-toggle" onClick={this.clickCommitSelector}>
                                <span className="text">{this.props.snapshot.git_snapshot.sha.slice(0,8)} ({date_str})</span>
                             </A>
        }

        var branchBaseUrl = "/project/" + this.props.project.pk;
        if (this.props.deepLink)
            branchBaseUrl += "/" + this.props.deepLink;

        var branchSelector = <BranchSelector
                                branch={this.props.branch}
                                branches={this.props.project.git_branches}
                                baseUrl={branchBaseUrl}
                                params={this.props.params}/>

        return  <div>
                    {commitModal}
                    {branchSelector}
                    {commitSelector}
                </div>;
    },

    clickCommitSelector: function(e){
        e.preventDefault();
        this.refs["commitModal"].open();
    },

    closeModal: function(e){
      this.refs.commitModal.close();
      return true;
    },
});

export default CommitSelector
