import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import Utils from "utils"
import {A} from "routing"
var createReactClass = require('create-react-class');

var PathSelector = createReactClass({
  displayName: 'PathSelector',

  propTypes: {
    //the path to be displayed
    path: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.node.isRequired,
      href: PropTypes.string
    })).isRequired,
    //the elements of the dropdown menu displayed after the last element
    childrenMenu: PropTypes.node
  },

  render: function(){
      var props = this.props
      var path = props.path

      var breadCrumbs = path.map(function(pathComponent, idx){
          if(pathComponent.hasOwnProperty("href")) {
            return <li key={idx}><A href={pathComponent.href}>{pathComponent.title}</A></li>
          } else {
            return <li key={idx}>{pathComponent.title}</li>
          }
      })

      var childrenMenu
      if (props.childrenDropdown && props.childrenDropdown.length) {
        childrenMenu =  <li className="path-dd">
            <div className="btn-group">
              <button className="btn-xs dropdown-toggle" data-toggle="dropdown">
                <span className="fa fa-chevron-right " />
              </button>
              <ul className="dropdown-menu">
                {this.props.childrenDropdown}
              </ul>
            </div>
          </li>
      }

      return <div className="path-selector">
          <ol className="path-list">
          {breadCrumbs}
          {childrenMenu}
          </ol>
        </div>

  }
})

export default PathSelector
