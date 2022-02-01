import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import {makeUrl, A} from "routing"
import Settings from "settings"
import LoaderMixin from "components/mixins/loader"
import ScheduledDowngradeInfo from "components/subscription/_scheduled_downgrade_info"
import Moment from "moment"
var createReactClass = require('create-react-class');
import PropTypes from 'prop-types';

var PaymentDetailsBox = createReactClass({
    displayName: "PaymentDetailsBox",

    mixins: [LoaderMixin],

    propTypes: {
        // callback which is called in order to get the subscription information of
        // the current user/organization
        // will be used by as resource endpoint and therefore called with
        // (urlParams, onSuccess, onError) as parameters
        getSubscription: PropTypes.func.isRequired,
        baseUrl: PropTypes.string.isRequired,
        params: PropTypes.object.isRequired,
    },

    resources: function(props) {
        return [{
            name: 'subscription',
            endpoint: props.getSubscription,
            mapping: {subscription: 'subscription'},
            params: [{}],
        }];
    },

    render: function () {
        var props = this.props;
        var subscription = this.state.data.subscription;

        var billing = subscription.billing
        var billing_excerpt = <em>No billing address provided</em>
        if(billing) {
            var billing_excerpt = billing.first_name + " " + billing.last_name;
            if (billing.company !== undefined && billing.company !== null && billing.company !== "") {
                billing_excerpt += ", " + billing.company;
            }
            billing_excerpt += ", " + billing.street;
        }

        var paymentMethod = <em>not provided</em>;
        if(subscription.credit_card_last4 !== undefined && subscription.credit_card_last4 !== null) {
            paymentMethod = <strong>Credit card *-{subscription.credit_card_last4}</strong>
        }

        return  <div className="content-box subscriptions">
                  <div className="head">
                    <h3>Billing overview</h3>
                  </div>
                  <div className="body clearfix">
                    <div className="row">
                      <div className="col-xs-12 col-sm-12">
                        {subscription.scheduled_downgrade
                          ? <ScheduledDowngradeInfo scheduledDowngrade={subscription.scheduled_downgrade}/>
                          : null
                        }
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xs-12 col-sm-6">
                        <p>
                          <span className="space-top-10">Current plan: <strong>FREE Personal User Plan</strong></span>
                        </p>
                      </div>
                      <div className="col-xs-12 col-sm-6">
                        <A href={makeUrl(props.baseUrl, {subpage: "plan_selection"}, props.params)} className="btn btn-primary pull-right">Change plan</A>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xs-12">
                        <hr/>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xs-12 col-sm-6">
                        <p>
                          Payment method: {paymentMethod} <br/>
                          {billing_excerpt}
                        </p>
                      </div>
                      <div className="col-xs-12 col-sm-6">
                        <A href={makeUrl(props.baseUrl, {subpage: "payment_details"}, props.params)} className="btn btn-primary pull-right">Change payment details</A>
                      </div>
                    </div>
                  </div>
                </div>;
    },
});

export default PaymentDetailsBox
