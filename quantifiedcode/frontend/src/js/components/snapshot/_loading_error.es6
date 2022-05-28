import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import Utils from "utils"
var createReactClass = require('create-react-class');

//renders an appropriate error message when loading a snapshot failed
var SnapshotLoadingError = createReactClass({
    displayName: "SnapshotLoadingError",

    propTypes: {
        //the project for which loading the snapshot failed
        project: PropTypes.any.isRequired,
        //under some circumstances this component will schedule a reload.
        //This callback will be called as soon as loading the snapshot should be retried.
        reload: PropTypes.func.isRequired,
    },

    componentWillUnmount: function() {
        if(this.reloadTimeout) {
            window.clearTimeout(this.reloadTimeout)
            this.reloadTimeout = undefined
        }
    },

    scheduleReload: function() {
        if(!this.reloadTimeout) {
          this.reloadTimeout = setTimeout(this.doReload, 10000)
        }
    },

    doReload: function() {
        this.props.reload()
        this.reloadTimeout = undefined
    },

    render: function() {
        var props = this.props
        var errorMessage
        var project = props.project
        //analysis already running/failed/finished
        if (project.analysis_status == "succeeded"){
          errorMessage = <div><h3 className="alert alert-warning"><i className="fa fa-exclamation-triangle" /> No such branch/commit found</h3></div>
        } else if (project.analysis_status == "in_progress"){
          //analysis running
          this.scheduleReload()
          errorMessage = <div><h3 className="alert alert-info"><i className="fa fa-spin fa-refresh" /> Analysis in progress...</h3></div>
        } else if (project.analysis_status == 'failed' && project.fetch_status != 'succeeded') {
          //fetch failed
          errorMessage = <div>
            <h3 className="alert alert-warning"><i className="fa fa-exclamation-triangle" /> We were unable to fetch this repository.</h3>
            <p>Please make sure that you configured the source settings correctly.</p>
          </div>
        } else if (project.analysis_status == 'failed') {
          //analysis failed
          errorMessage = <div>
            <h3 className="alert alert-warning"><i className="fa fa-exclamation-triangle" /> Analysis failed. Please check the Log tab.</h3>
          </div>
        } else {
          //queued, but not started so far
          this.scheduleReload()
          var queuePosition
          if (props.project) {
            queuePosition = <span>(queue position: <strong>{props.project.analysis_queue_position || 'unknown'}</strong>)</span>
          }
          errorMessage = <div>
          <p>This page will update automatically when the analysis completes. Please check "Log" tab for error(s)</p>
          </div>
        }
        return errorMessage
    },
})

export default SnapshotLoadingError
