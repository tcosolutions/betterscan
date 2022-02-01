import { render }  from 'react-dom';
import PropTypes from 'prop-types';
import React from "react"
import FormMixin from "components/mixins/form"

var createReactClass = require('create-react-class');
var Billing = createReactClass({
    displayName: 'Billing',

    mixins: [FormMixin],

    propTypes: {
        initialBillingData: PropTypes.object.isRequired,
    },

    fields: {
        first_name: {
            name: 'first name',
            required: true,
            requiredMessage: 'Please enter your first name.',
        },
        last_name: {
            name: 'last name',
            required: true,
            requiredMessage: 'Please enter your last name.',
        },
        email: {
            name: 'email',
            required: true,
            requiredMessage: "Please enter your email.",
        },
        company: {
            name: 'company',
            required: false,
        },
        street: {
            name: 'street',
            required: true,
        },
        apt: {
            name: 'appartment',
            required: false,
        },
        city: {
            name: 'city',
            required: true,
        },
        zip_code: {
            name: 'zip code',
            required: true,
        },
        country: {
            name: 'country',
            required: true,
        },
        state: {
            name: 'state',
            required: false,
        },
        vat_id: {
            name: 'vat id',
            required: false,
        }
    },

    getInitialState: function() {
        return this.props.initialBillingData;
    },

    render: function() {
        var state = this.state;

        return <form role="form" id="billingForm">
            <div className="row">
                <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="billingFirstName">First name</label>
                    <input type="text"
                        name="first_name"
                        value={state.first_name}
                        onChange={this.setter("first_name")}
                        className="form-control"
                        id="billingFirstName" />
                    {this.formatFieldError('first_name')}
                </div>
                <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="billingLastName">Last name</label>
                    <input type="text"
                        name="last_name"
                        value={state.last_name}
                        onChange={this.setter("last_name")}
                        className="form-control"
                        id="billingLastName" />
                    {this.formatFieldError('last_name')}
                </div>
            </div>
            <div className="row">
                <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="billingEmail">Email</label>
                    <input type="email"
                        name="email"
                        value={state.email}
                        onChange={this.setter("email")}
                        className="form-control"
                        id="billingEmail" />
                    {this.formatFieldError('email')}
                </div>
                <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="billingCompany">Company (optional)</label>
                    <input type="text"
                        name="company"
                        value={state.company}
                        onChange={this.setter("company")}
                        className="form-control"
                        id="billingCompany" />
                    {this.formatFieldError('company')}
                </div>
            </div>
            <div className="row">
                <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="billingStreet">Street</label>
                    <input type="text"
                        name="street"
                        value={state.street}
                        onChange={this.setter("street")}
                        className="form-control"
                        id="billingStreet" />
                    {this.formatFieldError('street')}
                </div>
                <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="billingApt">Suite / appartment (optional)</label>
                    <input type="text"
                        name="apt"
                        value={state.apt}
                        onChange={this.setter("apt")}
                        className="form-control"
                        id="billingApt" />
                    {this.formatFieldError("apt")}
                </div>
            </div>
            <div className="row">
                <div className="form-group col-xs-5 col-sm-6">
                    <label htmlFor="billingZipCode">Zip code</label>
                    <input type="text"
                        name="zip_code"
                        value={state.zip_code}
                        onChange={this.setter("zip_code")}
                        className="form-control"
                        id="billingZipCode" />
                    {this.formatFieldError("zip_code")}
                </div>
                <div className="form-group col-xs-7 col-sm-6">
                    <label htmlFor="billingCity">City</label>
                    <input type="text"
                        name="city"
                        value={state.city}
                        onChange={this.setter("city")}
                        className="form-control"
                        id="billingCity" />
                    {this.formatFieldError("city")}
                </div>
            </div>
            <div className="row">
                <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="billingCountry">Country</label>
                    <input type="text"
                        name="country"
                        value={state.country}
                        onChange={this.setter("country")}
                        className="form-control"
                        id="billingCountry" />
                    {this.formatFieldError("country")}
                </div>
                <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="billingState">State (optional)</label>
                    <input type="text"
                        name="state"
                        value={state.state}
                        onChange={this.setter("state")}
                        className="form-control"
                        id="billingState" />
                    {this.formatFieldError("state")}
                </div>
            </div>
            <div className="row">
                <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="billingVatId">VAT identification number (optional)</label>
                    <input type="text"
                        name="vat_id"
                        value={state.vat_id}
                        onChange={this.setter("vat_id")}
                        className="form-control"
                        id="billingVatId" />
                    {this.formatFieldError("vat_id")}
                </div>
            </div>
        </form>;
    },
});

export default Billing
