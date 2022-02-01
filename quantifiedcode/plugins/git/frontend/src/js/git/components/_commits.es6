import React from "react"
import LoaderMixin from "components/mixins/loader"
import Paginator from "components/generic/offset_paginator"
import Utils from "utils"
import {makeUrl, A} from "routing"
import ProjectApi from "git/api/project"
import Moment from "moment"

var SnapshotList = React.createClass({
    displayName: 'SnapshotList',

    propTypes: {
        //the project Id
        projectId: React.PropTypes.string.isRequired,
        //the snapshots which should be displayed
        snapshotGroups: React.PropTypes.array.isRequired,
        //an optional branch
        branch: React.PropTypes.string,
        //an optional click handler
        onClick: React.PropTypes.func,
        //parameters to be set in the URL
        params: React.PropTypes.object.isRequired,
        //a string which will be appended to the snapshot link
        deepLink: React.PropTypes.string
    },

    getDefaultProps: function (){
        return {'snapshotGroups' : [],'projectId' : ''};
    },

    render : function(){
        var snapshotGroups = this.props.snapshotGroups.map(function (snapshotGroup) {
              return <SnapshotGroup
                        snapshots={snapshotGroup.snapshots}
                        title={snapshotGroup.title}
                        projectId={this.props.projectId}
                        branch={this.props.branch}
                        onClick={this.props.onClick}
                        params={this.props.params}
                        deepLink={this.props.deepLink}>
                    </SnapshotGroup>;
            }.bind(this));

        return <div className="snapshot-groups">
            {snapshotGroups}
        </div>
    }
});

var SnapshotGroup = React.createClass({
    displayName: 'SnapshotGroup',

    propTypes: {
        //the title for this group of snapshots
        title: React.PropTypes.string.isRequired,
        //the project Id
        projectId: React.PropTypes.string.isRequired,
        //the snapshots which should be displayed
        snapshots: React.PropTypes.array.isRequired,
        //an optional branch
        branch: React.PropTypes.string,
        //an optional click handler
        onClick: React.PropTypes.func,
        //parameters to be set in the URL
        params: React.PropTypes.object.isRequired,
        //a string which will be appended to the snapshot link
        deepLink: React.PropTypes.string
    },

    render : function(){
        var snapshotItems = this.props.snapshots.map(function (snapshot) {
              return <SnapshotItem
                        snapshot={snapshot}
                        branch={this.props.branch}
                        projectId={this.props.projectId}
                        params={this.props.params}
                        onClick={this.props.onClick}
                        deepLink={this.props.deepLink}
                        key={snapshot.pk}
                        >
                    </SnapshotItem>;
            }.bind(this));
        return <div className="snapshot-list">
            <h4>{this.props.title}</h4>
            {snapshotItems}
        </div>
    }

});

var SnapshotItem = React.createClass({
    displayName: 'SnapshotItem',

    propTypes: {
        //the project Id
        projectId: React.PropTypes.string.isRequired,
        //the snapshot which should be displayed
        snapshot: React.PropTypes.object.isRequired,
        //an optional branch
        branch: React.PropTypes.string,
        //an optional click handler
        onClick: React.PropTypes.func,
        //parameters to be set in the URL
        params: React.PropTypes.object.isRequired,
        //a string which will be appended to the snapshot link
        deepLink: React.PropTypes.string
    },

    analyze : function(){
        ProjectApi.analyze(this.props.projectId);
        return false
    },

    onClick : function(){
        if (this.props.onClick !== undefined)
            this.props.onClick();
    },

    render : function(){
        var committerDate = Moment.unix(this.props.snapshot.committer_date_ts).format("HH:mm");

        if (this.props.snapshot.analyzed){
            var color = 'grey';
            var params = {};
            if (this.props.branch)
                params.branch = this.props.branch;
            var issuesTrend = undefined;
            var diff = this.props.snapshot.diff;
            if (diff && (diff.issues_added || diff.issues_fixed)){
                issuesTrend = <li className="issues-trend">
                    <i className="label label-danger"><i className="fa fa-chevron-down" /> {diff.issues_added}</i>&nbsp;
                    <i className="label label-success"><i className="fa fa-chevron-up" />{diff.issues_fixed}</i>
                </li>;

            }
            var baseUrl = "/project/" + this.props.projectId + "/snapshot/" + this.props.snapshot.pk;
            if(this.props.deepLink) baseUrl += "/" + this.props.deepLink;
            var snapshotUrl = makeUrl(baseUrl,params,this.props.params,['limit','offset']);
            return <div className="list-item snapshot-item">
                <A href={snapshotUrl} onClick={function(e){this.onClick()}.bind(this)}>
                    <div className="content">
                        <div className="meta clearfix">
                            <ul className="menu pull-right">
                                <li className="author">{this.props.snapshot.author_name}</li>
                                <li className="date">{committerDate}</li>
                                {issuesTrend}
                            </ul>
                        </div>
                        <p className="log">
                            {Utils.truncate(this.props.snapshot.log,80)}
                        </p>
                    </div>
                </A>
            </div>
        } else {
                var color = 'white';
                return <div className="list-item snapshot-item no-link">
                    <div className="content">
                        <div className="meta clearfix">
                            <span className="label label-warning pull-left">No data available</span>
                            <ul className="menu pull-right">
                                <li className="author">{this.props.snapshot.author_name}</li>
                                <li className="date">{committerDate}</li>
                            </ul>
                        </div>
                        <p className="log">
                            {Utils.truncate(this.props.snapshot.log,80)}
                        </p>
                    </div>
            </div>
        }
    }
})

var SnapshotListComponent = React.createClass({

    displayName: 'SnapshotListComponent',

    mixins : [LoaderMixin],

    resources : function(props){
        var params = {offset : props.params.offset !== undefined ? props.params.offset : 0,
                      limit : props.params.limit !== undefined ? props.params.limit : 20,
                      set_default: props.setDefault !== undefined ? true : false,
                      annotate: true}
        return [{
            name: 'snapshots',
            endpoint: ProjectApi.getGitSnapshots,
            params: [props.projectId, props.branch, params],
            mapping : {
                snapshots : 'snapshots',
                count: 'count'
            }
        }]
    },

    groupSnapshots : function(snapshots){
        var groupedSnapshots = [];
        var currentGroup = undefined;

        var calendarFormat = {
             'lastDay' : 'MMMM Do YYYY',
             'sameDay' : 'h:mmA',
             'nextDay' : 'MMMM Do YYYY',
             'lastWeek' : 'MMMM Do YYYY',
             'nextWeek' : 'MMMM Do YYYY',
             'sameElse' : 'MMMM Do YYYY'
        }

        for(var i in snapshots){
            var snapshot = snapshots[i];
            var title = Moment.unix(snapshot.committer_date_ts).calendar(null, calendarFormat);
            if (currentGroup === undefined || currentGroup.title !== title){
                if (currentGroup !== undefined)
                    groupedSnapshots.push(currentGroup);
                currentGroup = {title : title, snapshots : []};
            }
            currentGroup.snapshots.push(snapshot);
        }
        if (currentGroup !== undefined)
            groupedSnapshots.push(currentGroup);

        return groupedSnapshots;
   },

    afterLoadingSuccess : function(data){
        data.groupedSnapshots = this.groupSnapshots(data.snapshots);
        return data;
    },

    render : function(){
        var data = this.state.data;
        console.log("commits...")
        var paginator = <Paginator count={data.count !== undefined ? parseInt(data.count) : undefined}
                                   offset={this.props.params.offset !== undefined ? parseInt(this.props.params.offset) :0}
                                   limit={this.props.params.limit !== undefined ? parseInt(this.props.params.limit) : 20}
                                   baseUrl={this.props.baseUrl}
                                   params={this.props.params} />;
        return <div>
                    <SnapshotList
                        snapshotGroups={data.groupedSnapshots}
                        projectId={this.props.projectId}
                        onClick={this.props.onClick}
                        branch={this.props.branch}
                        params={this.props.params}
                        deepLink={this.props.deepLink}/>
                    {paginator}
                </div>
    }
})

export default SnapshotListComponent
