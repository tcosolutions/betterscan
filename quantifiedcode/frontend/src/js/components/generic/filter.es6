import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import Utils from "utils"
import {makeUrl, A} from "routing"

//compares 2 lists and returns True if they have different elements.
//the order of the elements is ignored.
function listsHaveDifferentElements(list1, list2) {
  //bypass expensive checks; taken most of the time
  if(list1.length != list2.length) return true
  //sorting and afterwards
  var list1Copy = list1.slice(0)
  list1Copy.sort()
  var list2Copy = list2.slice(0)
  list2Copy.sort()
  for(var i = 0; i < list1Copy.length; i++) {
    if(list1Copy[i] !== list2Copy[i]) {
      return true
    }
  }
  return false
}

var createReactClass = require('create-react-class');
var ParameterFilter = createReactClass({
  displayName: 'ParameterFilter',

  propTypes: {
    //the title of the filter box:
    title: PropTypes.string.isRequired,
    //the available filter values:
    values:PropTypes.arrayOf(PropTypes.shape({
      //the value which should be added/removed from the set of filter values
      value: PropTypes.any.required,
      //the title of this value
      title: PropTypes.string.isRequired,
      //a count number to be displayed next to the title
      count: PropTypes.number,
      //overrides the automatically built url
      url: PropTypes.string,
    }).isRequired).isRequired,
    //the name of the request parameter where the selected values should be stored
    param: PropTypes.string.isRequired,
    //the base url for building the links
    baseUrl: PropTypes.string.isRequired,
    //the params of the current request
    params: PropTypes.object.isRequired,
    //currently selected filter(s)
    //if not provided the current filter values are extracted from the params array
    currentFilter: PropTypes.oneOfType([
      PropTypes.any,
      PropTypes.arrayOf(PropTypes.any)
    ]),
    //the default value(s):
    default: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    //should the list be displayed as a dropdown
    dropdown: PropTypes.bool,
    //is this filter a multiple choice filter?
    multipleChoice: PropTypes.bool,
    //additional CSS classes to be added to the list elements
    extraClasses: PropTypes.string,
    //the label of the reset link; if not provided, no reset link is displayed
    resetDefaultLabel: PropTypes.string,
    //align dropdown menu to the right?
    right: PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      default: [], //empty selection
      dropdown: false,
      multipleChoice: false,
      extraClasses: "",
      right: true
    }
  },

  render: function() {
      //get the currently selected value and make sure, it is an array
      var currentlySelectedFilters = this.props.currentFilter
      if(currentlySelectedFilters === undefined) {
        currentlySelectedFilters = this.props.params[this.props.param]
      }
      if(currentlySelectedFilters === undefined) {
        currentlySelectedFilters = this.props.default
      }
      if(!Array.isArray(currentlySelectedFilters)) {
        currentlySelectedFilters = [currentlySelectedFilters]
      }

      //build the list of items
      var valuesList = this.props.values.map(function(value){
          var newFilterValues
          var classNames = []

          if (currentlySelectedFilters.indexOf(value.value) !== -1) {
            //this filter value is currently active
            classNames.push("active")
            if(this.props.multipleChoice) {
              //clicking it should remove the filter value
              //copy the array
              newFilterValues = currentlySelectedFilters.slice(0)
              //remove the valueKey
              newFilterValues.splice(newFilterValues.indexOf(value.value),1)
            } else {
              //clicking it should do nothing/select it again
              newFilterValues = currentlySelectedFilters
            }
          } else {
            //this filter is currently inactive
            classNames.push("inactive")
            //clicking it should add the filter value
            if(this.props.multipleChoice) {
              newFilterValues = currentlySelectedFilters.concat(value.value)
            } else {
              newFilterValues = [value.value]
            }
          }

          //build the URL
          var url
          if(value.hasOwnProperty("url")) {
            url = value.url
          } else {
            var newUrlParams = {}
            var deletedUrlParams = ['offset', 'limit']
            if(newFilterValues.length > 0) {
              newUrlParams[this.props.param] = newFilterValues
            } else {
              deletedUrlParams.push(this.props.param)
            }
            url = makeUrl(this.props.baseUrl,newUrlParams,this.props.params,deletedUrlParams)
          }

          //add the classnames for this entry
          classNames.push(this.props.param)
          classNames.push(this.props.param + "-" + value.value)

          //create the count label
          var count
          if (value.count !== undefined) {
              count = <span className="count">{Utils.addThousandSeparator(value.count)}</span>
          }

          return <li className={classNames.join(" ")} key={value.value}>
              <A href={url} title={value.title}>
                  <span className="title">{Utils.capitalizeFirstChar(value.title)}</span>
                  {count}
              </A>
          </li>
      }.bind(this))

      if (!valuesList.length)
        return <div/>

      //the "show all" link
      var resetDefaultLink
      //only show this link if a resetDefaultLabel text is provided
      //and if we currently do not have the default values selected
      var resetDefaultLabel = this.props.resetDefaultLabel
      if(listsHaveDifferentElements(currentlySelectedFilters, this.props.default) && resetDefaultLabel !== undefined) {
        var allUrl = makeUrl(this.props.baseUrl, [], this.props.params, [this.props.param, 'limit', 'offset'])
        resetDefaultLink = <A href={allUrl} className="pull-right all-link active">{resetDefaultLabel}</A>
      }

      //create the list of classes for this filter
      var filterSpecificClasses = [this.props.param + "-filter"]
      if (this.props.multipleChoice) filterSpecificClasses.push("multiple-choice")
      filterSpecificClasses.push(this.props.extraClasses)

      //create the markup for the dropdown/filter box
      if (this.props.dropdown) {
          var dropDownMenuRight = this.props.right ? "dropdown-menu-right" : ""
          return <li
              className={"dropdown attribute-filter " + filterSpecificClasses.join(" ")}
              data-title={this.props.title} data-attribute={this.props.param}>
              <A className="dropdown-toggle head" data-toggle="dropdown">
                  {this.props.title}
                  <span className="octicon octicon-triangle-down" />
              </A>
              <ul className={"dropdown-menu list " + dropDownMenuRight}>
                  {valuesList}
              </ul>
          </li>
      } else {
          return <div className={"box attribute-filter " + filterSpecificClasses.join(" ")}
              data-title={this.props.title}>
              <div className="head clearfix">
                  <h3 className="pull-left">{this.props.title}</h3>
                  {resetDefaultLink}
              </div>
              <div className="body">
                  <ul className="list">
                      {valuesList}
                  </ul>
              </div>
          </div>
      }
  }

})

export default ParameterFilter
