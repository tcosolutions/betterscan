import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import FormMixin from "components/mixins/form"
import Settings from "settings"
import FlashMessagesService from "flash_messages"
var createReactClass = require('create-react-class');

var PaymentForm =createReactClass({

    displayName: 'PaymentForm',

    mixins: [FormMixin],

    fields: {
        number: {
            name: 'card number',
            required: true,
            requiredMessage: 'Please enter card number.',
        },
        cvc: {
            name: 'cvc',
            required: true,
            requiredMessage: 'Please enter cvc number.',
        },
        exp_month: {
            name: 'expiration month',
            required: true,
            requiredMessage: 'Please enter card\'s expiration month.',
        },
        exp_year: {
            name: 'expiration year',
            required: true,
            requiredMessage: 'Please enter card\'s expiration year.',
        },
    },

    propTypes: {
        // the last 4 digits of the currently used credit card
        last4: PropTypes.string,
    },

    componentWillMount: function(){
        this.flashMessagesService = FlashMessagesService.getInstance();
        var _validate = this.validate;
        this.validate = function() {
            this.clearAllErrors();
            return this.formIsVisible() ? _validate() : true;
        }.bind(this);
    },

    formatStripeResponseError: function(error) {
        if (error.type === "card_error") {
            var errors = {};
            errors[error.param] = error.message;
            return {errors: errors}
        } else {
            return {message: error.message}
        }
    },
   
    
    getStripeToken: function(callback, errback) {
        if(!this.formIsVisible()) {
            callback(undefined)
            return;
        }
        /*
        require(['https://js.stripe.com/v2/'], function(stripe) {
            if(!this.formIsVisible()) {
                callback(undefined)
                return;
            }
            var stripeResponseHandler = function(state, response) {
                if (response.error) {
                    this.parseApiErrorData(this.formatStripeResponseError(response.error));
                    errback();
                    return;
                }
                callback(response.id);
            }.bind(this);
            try {
                window.Stripe.setPublishableKey(Settings.stripe.public_key);
                window.Stripe.card.createToken(
                    this.refs.form.getDOMNode(),
                    stripeResponseHandler
                );
            } catch(e) {
                this.flashMessagesService.postMessage({
                    sticky: true,
                    type: "danger",
                    description: "Unable to communicate with Stripe: " + e.message,
                    duration: 5000,
                });
                errback();
            }
        }.bind(this), function(err) {
            var failedId = err.requireModules && err.requireModules[0];
            requirejs.undef(failedId);
            this.flashMessagesService.postMessage({
                sticky: true,
                type: "danger",
                description: "Unable to communicate with Stripe",
                duration: 5000,
            });
            errback();
        }.bind(this));
         */
        return;
    },
   

    hideForm: function() {
        this.setState({"showForm": false});
    },

    showForm: function() {
        this.setState({"showForm": true});
    },

    formIsVisible: function() {
      var last4 = this.props.last4;
      return this.state.showForm || last4 === null || last4 === undefined;
    },

    render: function() {
      if(this.formIsVisible()) {
            return this.renderForm();
        } else {
            return this.renderPlaceholder();
        }
    },

    renderPlaceholder: function() {
        return  <p className="clearfix">
                    <span className="pull-left space-top-5">Paying with credit card ...-{this.props.last4}</span>
                    <button className="btn btn-sm btn-default pull-right"
                      onClick={this.showForm}>Use different card</button>
                </p>
    },

    renderForm: function() {
        var state = this.state;

        var formGroupExpDate = 'form_group clearfix';
        if (this.isFieldError('exp_year'))
            formGroupExpDate = this.formatFieldGroupError('exp_year', 'clearfix');
        else if (this.isFieldError('exp_month'))
            formGroupExpDate = this.formatFieldGroupError('exp_month', 'clearfix');

        return <form id="paymentForm" role="form" ref="form">
            <div className="row">
                <div className="form-group col-xs-8 col-sm-5">
                    <div className={this.formatFieldGroupError('number', 'clearfix')}>
                        <label htmlFor="card-number">Card number</label>
                        <input value={state.number}
                            onChange={this.setter("number", true)}
                            id="card-number"
                            className="form-control"
                            type="text"
                            size="20"
                            name="number"
                            data-stripe="number" />
                    </div>
                </div>
                <div className="form-group col-xs-4 col-sm-2">
                    <div className={this.formatFieldGroupError('cvc', 'clearfix')}>
                        <label htmlFor="cvc" className="control-label">CVC</label>
                        <input value={state.cvc}
                            onChange={this.setter("cvc", true)}
                            id="cvc"
                            className="form-control"
                            type="text"
                            size="4"
                            data-stripe="cvc" />
                    </div>
                </div>
                <div className="form-group col-xs-12 col-sm-5">
                    <div className={formGroupExpDate}>
                        <label htmlFor="expiration" className="control-label">Expiration (MM/YYYY)</label>
                        <div id="expiration" className="form-inline clearfix">
                            <div className="col-xs-3 col-sm-2 no-padding">
                                <input value={state.exp_month}
                                    onChange={this.setter("exp_month")}
                                    id="exp_month"
                                    className="form-control"
                                    type="text"
                                    size="2"
                                    maxLength="2"
                                    data-stripe="exp-month"
                                    placeholder="MM"/>
                            </div>
                            <div className="col-xs-2 col-sm-1">
                                <span className="space-top-10"> / </span>
                            </div>
                            <div className="col-xs-7 col-sm-8 no-padding">
                                <input value={state.exp_year}
                                    onChange={this.setter("exp_year")}
                                    id="exp_year"
                                    className="form-control"
                                    type="text"
                                    size="4"
                                    maxLength="4"
                                    data-stripe="exp-year"
                                    placeholder="YYYY"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="form-group col-xs-12">
                    {this.formatFieldError('number')}
                    {this.formatFieldError('cvc')}
                    {this.formatFieldError('exp_month')}
                    {this.formatFieldError('exp_year')}
                </div>
            </div>
        </form>;
    },
});

export default PaymentForm
