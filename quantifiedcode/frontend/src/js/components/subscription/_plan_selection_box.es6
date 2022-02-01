import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import Utils from "utils"
import {makeUrl, redirectTo, A} from "routing"
import Settings from "settings"
import FlashMessagesService from "flash_messages"
import Modal from "components/generic/modal"
import LoaderMixin from "components/mixins/loader"
import ScheduledDowngradeInfo from "components/subscription/_scheduled_downgrade_info"
import Moment from "moment"
var createReactClass = require('create-react-class');

var SubscriptionPlan = createReactClass({
    displayName: "SubscriptionPlan",
    /*
    propTypes: {
        // with keys name, price, description
        plan: PropTypes.shape({
          id: PropTypes.any.isRequired,
          name: PropTypes.string.isRequired,
          description: PropTypes.string.isRequired,
          price: PropTypes.number.isRequired,
        }).isRequired,
        status: PropTypes.oneOf(["up", "down", "current-downgrading", "current"]),
        // callback function called when the subscribe button is clicked
        subscribe: PropTypes.func.isRequired,
        disabled: PropTypes.bool.isRequired,
    },
     */
    subscribe: function(event) {
        event.preventDefault();
        this.props.subscribe();
    },

    render: function() {
        var props = this.props,
            plan = props.plan,
            button;

        var buttonAttrs = {
            onClick: this.subscribe,
            disabled: !!props.disabled,
        };

        if (props.status === "current") {
            button = <button className="btn btn-sm btn-default btn-block" {...buttonAttrs}>Current plan</button>;
        } else if (props.status === "current-downgrading") {
            button = <button className="btn btn-sm btn-primary btn-block" {...buttonAttrs}>Keep</button>;
        } else {
            button = <button className="btn btn-sm btn-primary btn-block" {...buttonAttrs}>{props.status == "down" ? "Downgrade" : "Upgrade"}</button>;
        }
        return <div className="subscription-plan row" data-plan-id={plan.id}>
            <div className="col-xs-12 col-md-2 space-top-5 space-bottom-5">
                <span className="plan-name">Monthly</span>
            </div>
            <div className="col-xs-12 col-md-5 space-top-5 space-bottom-5">
                <span className="plan-description">Commercial Plan</span>
            </div>
            <div className="col-xs-12 col-md-3 space-top-5 space-bottom-5">
                <span className="plan-price">${Utils.addThousandSeparator("9.90")}</span> / month
            </div>
            <div className="col-xs-12 col-md-2 space-top-5 space-bottom-5">
                {button}
            </div>
        </div>;
    },
});

var PlanSelectionBox = createReactClass({
    displayName: "PlanSelectionBox",

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

    getInitialState: function() {
        return {disabled: false}
    },

    subscribe: function(plan) {
        var subscription = this.state.data.subscription;
        var last4 = subscription.credit_card_last4;
        var props = this.props;
        // do we need to forward the user to the payment form?
        if(plan.price > 0 && (last4 === undefined || last4 === null || !subscription.billing)) {
            // forward him to the payment form
            redirectTo(makeUrl(props.baseUrl, {subpage: "payment_details", selectedPlan: plan.id}, props.params));
        } else {
            this.setState({disabled: true, selectedPlan: plan});
        }
    },

    doPurchase: function() {
        var onSuccess =function(data) {
          this.flashMessagesService.postMessage({
            type: "info",
            description: "Your subscription was successful! Thank you for using QuantifiedCode.",
            duration: 5000,
          });
          redirectTo(makeUrl(this.props.baseUrl, {}, this.props.params, ["subpage"]));
        }.bind(this);

        var onError = function(jqXHR, status, e) {
          var data = jqXHR.responseJSON;
          if(data.message) {
            this.flashMessagesService.postMessage({
              type: "danger",
              description: data.message,
              duration: 5000,
            });
          }
          this.setState({disabled: false, purchaseInProgress: false});
        }.bind(this);

        this.setState({purchaseInProgress: true});
        this.props.updateSubscription({plan: this.state.selectedPlan.id}, onSuccess, onError);
    },

    cancelPurchase: function() {
        this.setState({disabled: false, selectedPlan: undefined});
    },

    render: function () {
        var state = this.state,
          props = this.props,
          subscription = state.data.subscription,
          plansdescrobj = this.props.plans 
          var plansdescr = $.map(plansdescrobj, function(value, index) {
    return [value];
});
               
          var currentPlan = subscription.plan;
          //console.log(props);
          //console.log(state.data);

        var currentInterval;
        plansdescr.some(function(plan) {
            if(plan.id == currentPlan.id) {
                currentInterval = plan.interval;
                return true;
            }
        });

        var selectedInterval = props.params.plan_interval || currentInterval || "month";
        //var selectedInterval = "month";

        var plans = plansdescr.filter(function(plan){

            return plansdescrobj.interval == selectedInterval;
        }).map(function(plan) {
            var status = "up";
            var disabled = state.disabled;
            if((currentPlan.interval == "year" && plan.interval == "month" && currentPlan.price > 0) || currentPlan.price > plan.price) {
                status = "down";
            }
            if(plan.id === currentPlan.id) {
                status = subscription.scheduled_downgrade ? "current-downgrading" : "current";
                disabled |= !subscription.scheduled_downgrade;
            }
            var subscriptionPlan = <SubscriptionPlan
                key={plansdescrobj}
                plan={plan}
                status={status}
                subscribe={this.subscribe.bind(this, plan)}
                disabled={disabled} />;
            return subscriptionPlan;
        }.bind(this));

        var intervalBox;
        if(selectedInterval == "month") {
            intervalBox = <div className="alert alert-info">
                              Below you see our monthly plans.
                              We also offer <A
                                href={makeUrl(props.baseUrl, {plan_interval: "year"}, props.params)}
                                ><strong>annual plans</strong></A> which allow you to save a few dollars.<br />
                                Please contact info@topcodersonline.com to make us activate your paid plan.
                          </div>;
        } else if(selectedInterval == "year") {
            intervalBox = <div className="alert alert-success">
                              Great decision! By choosing one of the annual plans you are saving quite a bit over
                              our <A
                                href={makeUrl(props.baseUrl, {plan_interval: "month"}, props.params)}>
                                <strong>monthly plans</strong></A>. <br /> 
                                Please contact info@topcodersonline.com to make us activate your paid plan.
                          </div>;
        }


        return  <div className="content-box subscriptions">
            {this.renderModal()}
            <div className="head">
                <h3>Choose your plan</h3>
            </div>
            <div className="body clearfix">
                <div id="payment-plans">
                    {subscription.scheduled_downgrade
                      ? <ScheduledDowngradeInfo scheduledDowngrade={subscription.scheduled_downgrade}/>
                      : null
                    }
                    {intervalBox}
                </div>
            </div>
        </div>;
    },

    renderModal: function() {
        var selectedPlan = this.state.selectedPlan;
        if(!selectedPlan) return null;
        var confirmLabel = <span>Purchase {this.state.purchaseInProgress ? <i className="fa fa-refresh fa-spin"/> : undefined}</span>;
        var updatePlanModal = <Modal
            hidden={false}
            disabled={this.state.purchaseInProgress}
            confirm={confirmLabel}
            cancel="Cancel"
            onCancel={this.cancelPurchase}
            onConfirm={this.doPurchase}
            title="Change subscription">
              <p>Change your current subscription to plan <strong>{selectedPlan.name}</strong> (${Utils.addThousandSeparator(selectedPlan.price)} / {selectedPlan.interval})?</p>
          </Modal>;
        return updatePlanModal;
    },
});

export default PlanSelectionBox
