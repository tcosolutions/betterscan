import { render }  from 'react-dom';
import React from "react"
import PaymentDetailsBox from "components/subscription/_payment_details_box"
import PlanSelectionBox from "components/subscription/_plan_selection_box"
import BillingOverview from "components/subscription/_billing_overview"
import apis from "api/all"
var createReactClass = require('create-react-class');

var UserSubscription = createReactClass({
    displayName: 'UserSubscription',

    render: function() {
        //console.log(this.props);
        var subpage = this.props.params.subpage;
        var Component;
        if(subpage == "payment_details") {
            Component = PaymentDetailsBox;
        } else if(subpage == "plan_selection") {
            Component = PlanSelectionBox;
        } else {
            Component = BillingOverview;
        }
        return <Component
            getSubscription={apis.subscription.getUserSubscriptions}
            updateSubscription={apis.subscription.updateUserSubscription}
            plans={this.props.plans}
            baseUrl={this.props.baseUrl}
            params={this.props.params} />
    }
})

export default UserSubscription
