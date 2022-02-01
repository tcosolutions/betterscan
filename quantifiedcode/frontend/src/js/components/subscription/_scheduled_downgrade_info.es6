import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import Settings from "settings"
import Moment from "moment"
var createReactClass = require('create-react-class');

var ScheduledDowngradeInfo = createReactClass({
    displayName: "ScheduledDowngradeInfo",

    propTypes: {
        scheduledDowngrade: PropTypes.shape({
            new_plan: PropTypes.string.isRequired,
            time: PropTypes.string.isRequired,
        })
    },

    render: function() {
        var scheduledDowngrade = this.props.scheduledDowngrade;
        if(scheduledDowngrade) {
            var scheduledDate = Moment(scheduledDowngrade.time*1000).calendar()
            var newPlan;
            Settings.plans.some(function(plan) {
                if(plan.id == scheduledDowngrade.new_plan) {
                    newPlan = plan;
                    return true;
                }
            });
            return <div className="alert alert-warning">
                     Your plan will be switched to the <strong>{newPlan.name}</strong> plan on {scheduledDate}.
                   </div>
        }
        return null;
    }
});

export default ScheduledDowngradeInfo
