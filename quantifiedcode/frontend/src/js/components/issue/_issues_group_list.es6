import { render }  from 'react-dom';
import React from "react"
import Paginator from "components/generic/paginator"
import LoaderMixin from "components/mixins/loader"
import IssueHelpers from "helpers/issue"
import {makeUrl} from "routing"
import $ from "jquery"
var createReactClass = require('create-react-class');

var IssuesGroupList = createReactClass({

    displayName: 'IssuesGroupList',

    limit: 1000,

    mixins : [LoaderMixin],

    inlineComponent : true,

    resources : function(props){
        return this.props.resources(props)
    },

    render: function() {
        var props = this.props,
            state = this.state,
            fileRevisions = state.data.fileRevisions,
            count = state.data.count

        var groups = IssueHelpers.parseIssueGroupParams(props.params)
        var pagination

        var page = groups.params[props.group].page || 0
        var issueItems = fileRevisions.map(function(fileRevision,i){
            var active = i == groups.params[props.group].file
            var issueHref
            if (active){
                var newParams = IssueHelpers.updateIssueGroupParams(groups.params,props.group,{file : undefined})
                issueHref = makeUrl(props.baseUrl,{groups : IssueHelpers.issueGroupParamsToUrlParams(newParams)},props.params)
            }else{
                var newParams = IssueHelpers.updateIssueGroupParams(groups.params,props.group,{file : i})
                //we reset the occurrence parameter for the active group
                if (newParams[props.group] !== undefined)
                    delete newParams[props.group].occurrence
                issueHref = makeUrl(props.baseUrl,{groups : IssueHelpers.issueGroupParamsToUrlParams(newParams)},props.params)
            }

            var onChange = function(){
                this.reloadResources()
                if (this.props.onChange !== undefined)
                    this.props.onChange()
            }.bind(this)

            return props.generateIssueItem({
                fileRevision : fileRevision,
                issues : fileRevision.issues,
                issueHref : issueHref,
                active : active,
                onChange: onChange,
                })
        }.bind(this))
        if (count > this.limit) {
            var maxPage = Math.ceil(count/this.limit)-1
            var nextHref,prevHref
            if (page < maxPage){
                var newParams = $.extend({},groups.params)
                newParams[props.group].page = page + 1
                nextHref = makeUrl(props.baseUrl,
                                         {groups : IssueHelpers.issueGroupParamsToUrlParams(newParams)},
                                         props.params)
            }
            if (page > 0){
                var newParams = $.extend({},groups.params)
                newParams[props.group].page = page - 1
                prevHref = makeUrl(props.baseUrl,
                                             {groups : IssueHelpers.issueGroupParamsToUrlParams(newParams)},
                                             props.params)
            }
            pagination = <Paginator prevHref={prevHref} nextHref={nextHref} styles=""/>
        }
        return <ul className="issue-list">
            {issueItems}
            {pagination}
        </ul>
    }

})

export default IssuesGroupList
