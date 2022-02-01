import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import LoaderMixin from "components/mixins/loader"
import TabsMixin from "components/mixins/tabs"
import Breadcrumbs from "components/generic/breadcrumbs"
import ToggleSwitch from "components/generic/toggle_switch"
var createReactClass = require('create-react-class');

var AnalysisSettings = createReactClass({
    displayName: 'AnalysisSettings',

    componentDidMount : function() {
        Utils.trackEvent("Usage", "PS: Analysis settings viewed")
    },

    render: function() {
        var content
        return <div className="content-box">
            <div className="head">
                <h3>Analysis settings</h3>
            </div>
            <div className="body">
                <div>
                    {content}
                </div>
            </div>
        </div>
    }
})

export default AnalysisSettings
