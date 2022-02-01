import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import IssueHelpers from "helpers/issue"
import OffsetPaginator from "components/generic/offset_paginator"
import Content from "components/generic/content"
import Sidebar from "components/generic/sidebar"
import Toolbar from "components/generic/toolbar"
import OrderByBox from "components/generic/orderby_box"
import ParameterFilter from "components/generic/filter"
import LoaderMixin from "components/mixins/loader"
var createReactClass = require('create-react-class');

var IssueClassFilters = createReactClass({

    displayName: 'IssueClassFilters',

    getDefaultProps: function() {
      return {
        dropdown: false,
        right: true
      }
    },

    render: function () {

        var orderByBox = <OrderByBox
          sortOrders={[
            {title: 'Name', key:'title'},
            {title: 'Severity', key:'severity'},
            {title: 'Creation date', key:'created_at'},
            {title: 'Modification date', key: 'updated_at'}
          ]}
          sort={this.props.params.sort || this.props.sort}
          direction={this.props.params.direction || this.props.direction}
          params={this.props.params}
          baseUrl={this.props.baseUrl}
          dropdown={this.props.dropdown}
          right={this.props.right} />

        var categoryValues = [
          {value: "correctness", title: "Correctness"},
          {value: "maintainability", title: "Maintainability"},
          {value: "performance", title: "Performance"},
          {value: "readability", title: "Readability"},
          {value: "security", title: "Security"}
        ]

        var languageValues

        if (this.props.languages)
          languageValues = this.props.languages.map(function(language){
            return {value: language,title: language.charAt(0).toUpperCase() + language.slice(1)}
          })

        var analyzerValues

        if (this.props.analyzers)
          analyzerValues = this.props.analyzers.map(function(analyzer){
            return {value: analyzer,title: analyzer.charAt(0).toUpperCase() + analyzer.slice(1)}
          })

        var severityValues = [1,2,3,4].map(function(severity){
            return {value: ""+severity, title : IssueHelpers.titleForAttributeValue('severity',severity)}
        })

        var severityFilter = <ParameterFilter key="severityFilter"
                                              params={this.props.params}
                                              title="Severity"
                                              param="severity"
                                              baseUrl={this.props.baseUrl} 
                                              dropdown={this.props.dropdown}
                                              right={this.props.right}
                                              values={severityValues}
                                              multipleChoice
                                              resetDefaultLabel="show all"/>
        var categoryFilter = <ParameterFilter key="categoryFilter"
                                              params={this.props.params}
                                              title="Category"
                                              param="categories"
                                              baseUrl={this.props.baseUrl} 
                                              dropdown={this.props.dropdown}
                                              right={this.props.right}
                                              values={categoryValues}
                                              multipleChoice
                                              resetDefaultLabel="show all"/>
        var typeFilter
        if (this.props.project)
            typeFilter = <ParameterFilter key="typeFilter"
                                          params={this.props.params}
                                          title="Type"
                                          param="type"
                                          baseUrl={this.props.baseUrl} 
                                          dropdown={this.props.dropdown}
                                          right={this.props.right}
                                          values={[{value: "enabled", title: "enabled"},
                                                   {value: "disabled", title: "disabled"},
                                                   {value: "all", title: "all"}]} />
        var languageFilter
        if (languageValues)
            languageFilter = <ParameterFilter key="languageFilter"
                                              params={this.props.params}
                                              title="Language"
                                              param="language"
                                              baseUrl={this.props.baseUrl} 
                                              dropdown={this.props.dropdown}
                                              right={this.props.right}
                                              values={languageValues}
                                              multipleChoice
                                              resetDefaultLabel="show all"/>

        var analyzerFilter
        if (analyzerValues)
            analyzerFilter = <ParameterFilter key="analyzerFilter"
                                              params={this.props.params}
                                              title="Analyzer"
                                              param="analyzer"
                                              baseUrl={this.props.baseUrl} 
                                              dropdown={this.props.dropdown}
                                              right={this.props.right}
                                              values={analyzerValues}
                                              multipleChoice
                                              resetDefaultLabel="show all"/>

        if (this.props.dropdown) {
            return <ul className="dropdowns">
                {typeFilter}
                {severityFilter}
                {categoryFilter}
                {languageFilter}
                {analyzerFilter}
                {orderByBox}
            </ul>
        }
        else {
            return <div>
                    {severityFilter}
                    {categoryFilter}
                    {languageFilter}
                    {orderByBox}
                </div>
        }

    }

})

export default IssueClassFilters
0
