import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import ParameterFilter from "components/generic/filter"
import IssueHelpers from "helpers/issue"
import {makeUrl, A} from "routing"
import $ from "jquery"
var createReactClass = require('create-react-class');
var IssuesFilters = createReactClass({
    displayName: 'IssuesFilters',

    propTypes: {
      baseUrl: PropTypes.string.isRequired,
      params: PropTypes.any.isRequired,
      //the issues to be filtered; required for calculating the counts
      issues: PropTypes.any.isRequired,
      //should the filter be rendered as a dropdown
      dropdown: PropTypes.bool,
      //additional CSS classes to be applied to the filters
      extraClasses: PropTypes.string,
      //which attributes should be filtered?
      filterAttributes: PropTypes.arrayOf(PropTypes.string),
      //which attributes are multiple choice attributes
      multipleChoiceAttributes: PropTypes.objectOf(PropTypes.bool),
      //the currently selected filters
      filters: PropTypes.objectOf(PropTypes.any).isRequired,
      //additional filters which should be displayed in this filter list
      additionalFilters: PropTypes.func,
    },

    getDefaultProps : function(){
      return {
        filterAttributes : ["severity","categories","language"],
        multipleChoiceAttributes : {"categories" : true,
                                    "severity" : true,
                                    "language" : true},
        dropdown: false
      }
    },

    //creates the lists of values which are selectable in the filter lists.
    buildFilterValues: function(attribute, multipleChoice) {
      var currentlySelectedFilters = this.props.filters[attribute]
      if(currentlySelectedFilters === undefined)
        currentlySelectedFilters = []
      if(!Array.isArray(currentlySelectedFilters))
        currentlySelectedFilters = [currentlySelectedFilters]
      //copy the current filters
      var currentFilters = $.extend({},this.props.filters)
      var attributeIdx = this.props.filterAttributes.indexOf(attribute)

      //remove all filter values which are "lower" in the filter hierarchy
      //and the own filter
      var lowerAttributes = this.props.filterAttributes.slice(attributeIdx)
      delete currentFilters[lowerAttributes[0]]

      //now, filter the issues using these filters in order to get the issues
      //which would be displayed if just these filters were used
      var filteredIssues = IssueHelpers.filterIssues(this.props.issues,currentFilters)
      //and create a list of the possible values on which we could filter
      var values = IssueHelpers.valuesFor(filteredIssues, attribute)
      values.sort()
      //enrich this list with some meta informations
      var values = values.map(function(value) {
        //how many results would remain if we applied this filter?
        var count = IssueHelpers.countFor(IssueHelpers.issuesFor(filteredIssues,attribute,value))[1]
        //create the URL
        //check, how we should modify the filter
        //CODEDUPLICATE! we should make a decision if we want to merge it
        var newFilterValues
        if (currentlySelectedFilters.indexOf(value) !== -1) {
          //this filter value is currently active
          if(multipleChoice) {
            //clicking it should remove the filter value
            //copy the array
            newFilterValues = currentlySelectedFilters.slice(0)
            //remove the value
            newFilterValues.splice(newFilterValues.indexOf(value),1)
          } else {
            //clicking it should do nothing/select it again
            newFilterValues = currentlySelectedFilters
          }
        } else {
          //this filter is currently inactive
          //clicking it should add the filter value
          if(multipleChoice) {
            newFilterValues = currentlySelectedFilters.concat(value)
          } else {
            newFilterValues = [value]
          }
        }
        //adjust the URL parameters
        //CODEDUPLICATE! we should make a decision if we want to merge it
        var newUrlParams = {}
        var deletedUrlParams = ['offset', 'limit']
        if(newFilterValues.length > 0) {
          newUrlParams[attribute] = newFilterValues
        } else {
          deletedUrlParams.push(attribute)
        }
        //remove all filters which are useless if we choose this filter
        var itemFilters = $.extend({}, this.props.filters)
        itemFilters[attribute] = newFilterValues
        //build the URL
        var url = makeUrl(this.props.baseUrl,newUrlParams,this.props.params,deletedUrlParams)
        //add the title
        var title = IssueHelpers.titleForAttributeValue(attribute,value)
        return {
          value: value,
          title: title,
          count: count,
          url: url
        }
      }.bind(this))
      return values
    },

    render : function(){
      var attributeFilters = this.props.filterAttributes.map(function(attribute, idx) {
        var multipleChoice = !!this.props.multipleChoiceAttributes[attribute]
        return <ParameterFilter
                  key={attribute}
                  title={IssueHelpers.titleForAttributeName(attribute)}
                  values={this.buildFilterValues(attribute, multipleChoice)}
                  param={attribute}
                  currentFilter={this.props.filters[attribute]}
                  baseUrl={this.props.baseUrl}
                  params={this.props.params}
                  multipleChoice={multipleChoice}
                  resetDefaultLabel="Show all"
                  extraClasses={this.props.extraClasses}
                  dropdown={this.props.dropdown}/>
      }.bind(this))

      var additionalFilters
      //we generate additional filters with the dropdown property correctly set...
      if (this.props.additionalFilters)
        additionalFilters = this.props.additionalFilters(this.props.dropdown)
      if (this.props.dropdown) {
        return <ul className="dropdowns" data-filters>
          {additionalFilters}
          {attributeFilters}
        </ul>
      } else {
        return <div data-filters>
          {additionalFilters}
          {attributeFilters}
        </div>
      }
    }
})

export default IssuesFilters
