import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import Utils from "utils"
import {makeUrl, A} from "routing"

var createReactClass = require('create-react-class');

var OrderByBox = createReactClass({
    displayName: "OrderByBox",

    propTypes: {
      //the available sort orders
      sortOrders: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired,
        defaultDirection: PropTypes.oneOf(["desc", "asc"])
      }.isRequired)).isRequired,
      //the currently selected filter criterion
      sort: PropTypes.string,
      //the currently selected sort direction
      direction: PropTypes.oneOf(["desc", "asc"]),
      dropdown: PropTypes.bool,
      baseUrl: PropTypes.string.isRequired,
      params: PropTypes.any.isRequired
    },

    getDefaultProps: function (){
        return {
          dropdown: true,
          right: true
        }
    },

    render: function() {
        var sort = this.props.sort
        var direction = this.props.direction
        var sortOrders = this.props.sortOrders

        var boxItems = sortOrders.map(function(sortOrder){

            var defaultSortDirection = sortOrder.defaultDirection || 'desc'
            var reverseSortDirection = (direction == 'desc') ? 'asc' : 'desc'
            var newSortDirection = (sort == sortOrder.key) ? reverseSortDirection : defaultSortDirection

            var filterHref = makeUrl(this.props.baseUrl, {sort: sortOrder.key, direction: newSortDirection, offset: 0}, this.props.params)

            var filterListItem
            if (sort != sortOrder.key) {
              //currently not selected
              filterListItem = <li key={sortOrder.key}><A className="link" href={filterHref}>{Utils.capitalizeFirstChar(sortOrder.title)}</A></li>
            } else {
              var sortButtons
              //currently selected
              if (direction == 'desc' && sort) {
                  sortButtons = <div className="controls pull-right">
                                      <A className="button pull-left" href={filterHref}>
                                          <span className="fa fa-caret-up left text-center"></span>
                                      </A>
                                      <div className="button-selected pull-right">
                                          <span className="fa fa-caret-down left text-center"></span>
                                      </div>
                                  </div>
              } else {
                  sortButtons = <div className="controls pull-right">
                                      <div className="button-selected pull-left" >
                                          <span className="fa fa-caret-up text-center"></span>
                                      </div>
                                      <A className="button pull-right" href={filterHref}>
                                          <span className="fa fa-caret-down text-center"></span>
                                      </A>
                                  </div>
              }
              filterListItem = <li key={sortOrder.key} className='clickable selected clearfix'>
                                  <A className="pull-left filter-title" href={filterHref}>{Utils.capitalizeFirstChar(sortOrder.title)}</A>
                                  {sortButtons}
                              </li>
            }
            return  filterListItem
        }.bind(this))

        if (this.props.dropdown) {
            var dropDownMenuRight = this.props.right ? "dropdown-menu-right" : ""
            return <li className="dropdown">
                        <A className="dropdown-toggle" data-toggle="dropdown"><span className="fa fa-sort-amount-asc" /></A>
                        <ul className={"dropdown-menu list " + dropDownMenuRight}>
                            {boxItems}
                        </ul>
                    </li>
        } else {
            return <div className="box">
                <div className="head">
                    <h3>Order By</h3>
                </div>
                <div className="body">
                    <ul className="list">
                        {boxItems}
                    </ul>
                </div>
            </div>
        }
    }
})

export default OrderByBox
