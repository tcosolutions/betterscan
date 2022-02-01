import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import Utils from "utils"
import {A} from "routing"
var createReactClass = require('create-react-class');
var Paginator = createReactClass({
    displayName: 'Paginator',

    propTypes: {
      //the href of the previous page
      prevHref: PropTypes.string,
      //the href of the next page
      nextHref: PropTypes.string,
    },

    getDefaultProps : function(){
      return {prevDisabled: false, nextDisabled: false, styles : 'pull-right'}
    },

    render : function(){
      var props = this.props

      var nextButton
      if (props.nextHref) {
        nextButton = <A className="button page-right pull-right all-radius-sm" href={props.nextHref}>
                         <span className="fa fa-caret-right"></span>
                     </A>
      } else {
        nextButton = <span className="button-inactive page-right pull-right all-radius-sm">
                         <span className="fa fa-caret-right"></span>
                     </span>
      }

      var prevButton
      if (props.prevHref){
        prevButton = <A className="button page-left pull-left all-radius-sm" href={props.prevHref}>
                        <span className="fa fa-caret-left"></span>
                     </A>
      } else {
        prevButton = <span className="button-inactive page-left pull-left all-radius-sm">
                         <span className="fa fa-caret-left"></span>
                     </span>
      }

      return <div className={"paginator space-top-5 "+this.props.styles}>
                {prevButton} {nextButton}
              </div>
    }
})

export default Paginator
