import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import {addCallback, removeCallback, redirectTo} from "routing"
import $ from "jquery"
import Modal from "components/generic/modal"

var FormMixin = {

    isFieldError : function(field){
        if (this.state.fieldErrors !== undefined)
            if (field in this.state.fieldErrors)
                return true
        return false
    },

    formatFieldError : function(field){
        if (this.state.fieldErrors !== undefined)
            if (field in this.state.fieldErrors)
                return <p className="alert alert-warning">{this.state.fieldErrors[field]}</p>
        return undefined
    },

    setter : function(name, trim){
        return function(e){
            e.preventDefault()

            var d = {}
            if (trim === true)
                d[name] = $.trim(e.target.value)
            else
                d[name] = e.target.value

            if (d[name] == this.state[name])
                return;//nothing changed...
            this.setState(d)

        }.bind(this)
    },

    getInitialState : function(){
        return {disabled: false}
    },

    formatErrorMessage : function(){
        if (this.state.errorMessage !== undefined)
            return <p className="alert alert-warning">{this.state.errorMessage}</p>
        return undefined
    },

    formatFieldGroupError : function(field, classes){
        if (this.isFieldError(field))
            return "form-group has-warning " + classes
        return "form-group " + classes
    },

    clearFieldError: function(field){
        var newErrors = $.extend({}, this.state.fieldErrors)
        delete newErrors[field]
        this.setState({fieldErrors:newErrors})
    },

    clearAllErrors: function(){
        this.setState({
            fieldErrors: {},
            errorMessage: undefined,
        })
    },

    addFieldError: function(field, message){
        var newErrors = this.state.fieldErrors
        newErrors[field] = message
        this.setState({fieldErrors:newErrors})
    },

    setErrorMessage: function(message){
        this.setState({errorMessage: message})
    },

    clearErrorMessage: function(){
        this.setState({errorMessage: undefined})
    },

    hasErrors : function(){
        if (this.state.fieldErrors === undefined || Object.keys(this.state.fieldErrors).length > 0)
            return true
        return false
    },

    getValues : function() {
        var values = {}
        for(var name in this.fields){
            values[name] = this.state[name]
        }
        return values
    },

    componentDidMount: function(){
        this.clearAllErrors()
        if (this.props.apiErrorData !== undefined)
            this.parseApiErrorData(this.props.apiErrorData)
    },

    componentWillReceiveProps : function(props){
        if (props.apiErrorData) {
            this.clearAllErrors()
            this.parseApiErrorData(props.apiErrorData)
        }
    },

    renderWithModal : function(){
        var modal = <Modal
            ref="leavePageModal"
            confirm="Leave page"
            cancel="Stay here"
            disabled={false}
            onCancel={function(){this.leavePage = false;this.newUrl = undefined;}.bind(this)}
            onConfirm={function(){redirectTo(this.newUrl);}.bind(this)}
            title={[<i className="fa fa-exclamation-triangle" />," Unsaved data"]}>
                <p>There is <strong>unsaved data</strong> in the form you were editing. This data will get lost if you leave this page! Are you sure you want to leave?</p>
      </Modal>
      return <div>
            {modal}
            {this._renderform()}
        </div>
    },

    componentWillMount : function(){
        this._renderform = this.render
        this.render = this.renderWithModal

        if (this.isDirty === undefined)
            this.isDirty = function(){return false;}

        this.callback = function(url,fullUrl,newUrl){
            if (!this.isMounted() || ! this.isDirty() || this.leavePage)
                return true
            this.refs.leavePageModal.open()
            this.leavePage = true
            this.newUrl = newUrl
            return false
        }.bind(this)
        addCallback("onUrlChange",this.callback)
    },

    componentWillUnmount : function(){
        removeCallback("onUrlChange",this.callback)
    },

    parseApiErrorData: function(data){
        if (data === undefined)
            return this.clearAllErrors()
        this.setState({
            fieldErrors: data.errors || {},
            errorMessage: data.message || undefined,
        })
    },

    disable : function(){
        this.setState({disabled : true})
    },

    enable : function(){
        this.setState({disabled : false})
    },

    validate: function(data) {
        if(data === undefined) data = this.state
        this.clearAllErrors()
        var validated = true
        var fieldErrors = {}
        for(var name in this.fields){
            var field = this.fields[name]
            if (!(name in data) || data[name] === undefined || data[name] === ''){
                if (field.required){
                    validated = false
                    fieldErrors[name] = field.requiredMessage || ("Please enter a "+ (field.name || name)+".")
                }
                continue
            } else {
                if ('regex' in field){
                    "^[\\w\\d-]{4,30}$"
                    var regex = RegExp(field['regex'])
                    if(!regex.test(data[name])){
                        validated = false
                        fieldErrors[name] = "Invalid value for " + (field.name || name) + "."
                    }
                }
                if ('validator' in field){
                    try {
                        field.validator.bind(this)(data[name], name, data)
                    } catch(e) {
                        if (typeof e == "string")
                            fieldErrors[name] = e
                        else
                            fieldErrors[name] = e.message
                        validated = false
                    }
                }
            }
        }
        this.setState({fieldErrors : fieldErrors})
        return validated
    },

}

export default FormMixin
