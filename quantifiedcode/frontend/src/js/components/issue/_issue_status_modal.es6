import { render }  from 'react-dom';
import React from "react"
import Modal from "components/generic/modal"
import FormMixin from "components/mixins/form"
import IssueApi from "api/issue"
var createReactClass = require('create-react-class');

var IssueStatusModal = createReactClass({

    displayName: 'IssueStatusModal',

    mixins: [FormMixin],

    onSubmit: function(){

        var data

        if (!this.props.issue.ignore)
            data = {
                ignore_reason : this.state.ignore_reason,
                ignore_comment: this.state.ignore_comment,
                ignore: true
            }
        else
            data = {
                ignore: '',
                ignore_reason: 2,
                ignore_comment: ''
            }

        var onError = function(xhr){
            this.parseApiErrorData(xhr.responseJSON)
            this.enable()
        }.bind(this)

        var onSuccess = function(data){
            if (this.props.onChange !== undefined)
                this.props.onChange()
            this.refs.ignoreIssueModal.close()
            this.enable()
        }.bind(this)

        this.disable()
        IssueApi.updateIssueStatus(this.props.project.pk,
                                   this.props.issue.pk,
                                   data,
                                   onSuccess,
                                   onError)
    },

    onCancel: function(){

        this.refs.ignoreIssueModal.close()

    },

    open: function(){
        this.refs.ignoreIssueModal.open()
    },

    getInitialState: function(){
        return {
            ignore_comment : "",
            ignore_reason: "1"
        }
    },

    render: function(){

        var props = this.props,
            state = this.state,
            ignore = props.issue.ignore,
            ignoreReason,
            ignoreComment

        if (!ignore){
            ignoreReason = [
                this.formatFieldError('ignore_reason'),
                <select onChange={this.setter('ignore_reason')} value={state.ignore_reason} className="form-control" name="ignore_reason">
                    <option value="1">it is not relevant</option>
                    <option value="2">it is a false positive</option>
                    <option value="3">other reason</option>
                </select>]
            ignoreComment = [
                <br />,
                this.formatFieldError('ignore_comment'),
                <input name="ignore_comment" value={state.ignore_comment} onChange={this.setter('ignore_comment')} className="form-control" placeholder="optional: enter a comment" />
                ]
        }

        return <Modal
            ref="ignoreIssueModal"
            confirm={ignore ? "Un-ignore issue" : "Ignore issue"}
            cancel="Cancel"
            disabled={false}
            onCancel={this.onCancel}
            onConfirm={this.onSubmit}
            title={[<i className="fa fa-exclamation-triangle" />,ignore ? " Un-ignore issue" : " Ignore issue"]}>
                {this.formatErrorMessage()}
                <p>Why do you want to {ignore ? 'un-' : ''}ignore this issue?</p>
                <form className="form">
                    <fieldset>
                        {ignoreReason}
                        {ignoreComment}
                    </fieldset>
                </form>
        </Modal>
    }
})

export default IssueStatusModal
