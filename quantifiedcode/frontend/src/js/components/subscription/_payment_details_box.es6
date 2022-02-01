import { render }  from 'react-dom';
import React from "react"
import PropTypes from 'prop-types';
import {makeUrl, redirectTo, A} from "routing"
import Settings from "settings"
import FlashMessagesService from "flash_messages"
import LoaderMixin from "components/mixins/loader"
import BillingForm from "components/subscription/_billing"
import PaymentForm from "components/subscription/_payment_form"
var createReactClass = require('create-react-class');

var PaymentDetailsBox = createReactClass({
    displayName: "PaymentDetailsBox",

    mixins: [LoaderMixin],

    propTypes: {
        // callback which is called in order to get the subscription information of
        // the current user/organization
        // will be used by as resource endpoint and therefore called with
        // (urlParams, onSuccess, onError) as parameters
        getSubscription: PropTypes.func.isRequired,
        // callback which is called in order to update the subscription of the user/organization
        // Will be called with (newData, onSuccess, onError) as parameters
        updateSubscription: PropTypes.func.isRequired,
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

    componentWillMount: function(){
        this.flashMessagesService = FlashMessagesService.getInstance();
    },

    save: function(event) {
        //called if the user presses the purchase/save button.
        event.preventDefault();
        var billingFormValid = this.refs.billingForm.validate()
        var paymentFormValid = this.refs.paymentForm.validate()
        if (!paymentFormValid || !billingFormValid)
            return;
        this.setState({disabled: true});
        //Since we first have to request a Stripe token asynchronously,
        //we can not send a request to our API directly. Therefore, this
        //function only gets the stripe token and delegate the further steps
        //to another function
        /*
        this.refs.paymentForm.getStripeToken(
          this.doSave,
          function() {
            this.setState({disabled: false});
          }.bind(this)
        );
        */
        this.doSave();
    },

    doSave: function() {
        //we must revalidate the entries since the data might have changed in the meantime
        var billingFormValid = this.refs.billingForm.validate()
        var paymentFormValid = this.refs.paymentForm.validate()
        if (!paymentFormValid || !billingFormValid)
            return;

        var props = this.props,
            state = this.state;

        var data = {
          billing: this.refs.billingForm.getValues(),
          //payment_token: token,
          payment_token: "dummy",
          plan: props.params.selectedPlan
        };

        var onSuccess =function(data) {
            var message = props.params.selectedPlan ?
                "Your subscription is active! Thank you for using QuantifiedCode." :
                "Your payment details were updated.";
            this.flashMessagesService.postMessage({
                type: "info",
                description: message,
                duration: 5000,
            });
            redirectTo(makeUrl(props.baseUrl, {}, props.params, ["subpage", "selectedPlan"]));
        }.bind(this);

        var onError = function(jqXHR, status, e) {
            this.setState({disabled: false});
            var data = jqXHR.responseJSON;
            this.refs.billingForm.parseApiErrorData(data);
            if(data.message) {
                this.flashMessagesService.postMessage({
                    type: "danger",
                    description: data.message,
                    duration: 5000,
                });
            }
        }.bind(this);

        this.props.updateSubscription(data, onSuccess, onError);
    },

    render: function () {
        var state = this.state,
            props = this.props;
        
        

        var selectedPlan;
        var selectedPlanId = props.params.selectedPlan;
        if(selectedPlanId !== undefined) {
            Settings.plans.some(function(plan) {
                if(plan.id === selectedPlanId) {
                    selectedPlan = plan;
                    return true;
                }
            });
        }
        var selectedPlanBox;
        if(selectedPlan) {
            selectedPlanBox = <div className="alert alert-info">
              You are about to buy the <strong>{selectedPlan.name}</strong> plan for ${selectedPlan.price} per {selectedPlan.interval}. (<A href={makeUrl(props.baseUrl, {tab: "billing", subpage: "plan_selection"})}><strong>Select a different plan</strong></A>)
            </div>;
        }
       

        return  <div className="content-box subscriptions">
            <div className="head">
                <h3>Payment details</h3>
            </div>
            <div className="body clearfix">
                {selectedPlanBox}
                <div id="payment-details">
                    <h3>Credit card</h3>
                    <PaymentForm
                        ref="paymentForm"
                        disabled={state.disabled}
                        last4={state.data.subscription.credit_card_last4} />
                </div>
                <div id="billing-info">
                    <h3>Billing information</h3>
                    <BillingForm
                        ref="billingForm"
                        disabled={state.disabled}
                        initialBillingData={state.data.subscription.billing} />
                </div>
                <button disabled={state.disabled}
                    onClick={this.save}
                    className="btn btn-primary pull-right purchaseBtn"
                    >
                    {selectedPlan ? "Purchase" : "Save"}</button>
            </div>
        </div>;
    },
});

export default PaymentDetailsBox
