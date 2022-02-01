import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import Utils from "utils"
import IssueHelpers from "helpers/issue"
import OffsetPaginator from "components/generic/offset_paginator"
import Sidebar from "components/generic/sidebar"
import Toolbar from "components/generic/toolbar"
import QueryInfo from "components/generic/query_info"
import ParameterFilter from "components/generic/filter"
import LoaderMixin from "components/mixins/loader"
var createReactClass = require('create-react-class');


var Content = createReactClass({

    displayName: 'Content',

    propTypes: {
    },

    getDefaultProps: function() {
      return {contentId: "content", pil: false}
    },

    getInitialState: function() {
        //responsive = true, if screen gets to narrow
        //right has to be false then, to align dropdown menus to the left
        var responsive = this.isCompactScreen(992)
        var dropDownMenuRight = !this.isCompactScreen(768)
        return {
                responsive: responsive,
                right : dropDownMenuRight
            }
    },

    isCompactScreen: function(num) {
        if (num <= 768 && this.props.forceCompact)
            return false
        else if (document.body.clientWidth <= num || this.props.forceCompact)
            return true
        return false
    },

    alignMenuRight: function() {

    },

    componentDidMount: function() {
        window.addEventListener('resize', this.handleResize)
    },

    handleResize: function(e) {
        this.setState({
            responsive: this.isCompactScreen(992),
            right: !this.isCompactScreen(768)
        })
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this.handleResize)
    },

    render : function(){
        var props = this.props

        var sidebarContent
        if (props.sidebarContent !== undefined) {
            sidebarContent = React.cloneElement(props.sidebarContent, { dropdown: this.state.responsive, right: this.state.right})
        }

        var dropdowns,
            sidebar,
            toolbarLeftSize,
            contentSize

        // Todo: add order-by box to responsive screen
        if (this.state.responsive) {
            dropdowns = <div className="col-xs-12 no-padding toolbar-dropdowns">
                            {sidebarContent}
                      </div>
            sidebar = null
            toolbarLeftSize = "col-xs-12 compact-form"
            contentSize = "col-md-12"
        }
        else {
          dropdowns = undefined
          sidebar = <div className="col-md-3">
                      <Sidebar>
                          {sidebarContent}
                      </Sidebar>
                  </div>
          toolbarLeftSize = "col-xs-9"
          contentSize = "col-md-9"
        }

        var toolbarContent = <div className="toolbar">
                                    <div className={"criterias no-padding " + toolbarLeftSize}>
                                      {props.toolbarLeftContent}
                                    </div>
                                    {dropdowns}
                                </div>

        var paginator
        if(props.paginator) {
          paginator = <div className="clearfix">
                            {props.paginator}
                        </div>
        }

        var tabs
        if(props.tabs) {
          tabs = <div className="row">
                        <div className="col-xs-12 clearfix">
                            <div>
                                {props.tabs}
                            </div>
                        </div>
                    </div>
        }

        var pil = props.pil ? "pil" : null

        return  <div>
                  {tabs}
                  <div id={props.contentId} className="row">
                    <div className={contentSize}>
                        <div>
                          <Toolbar>
                            {toolbarContent}
                          </Toolbar>
                        </div>
                        <div className={"no-padding " + pil}>
                            <QueryInfo params={props.params} baseUrl={props.baseUrl} />
                            {props.content}
                        </div>
                        {paginator}
                    </div>
                    {sidebar}
                  </div>
                </div>
    },
})

export default Content
