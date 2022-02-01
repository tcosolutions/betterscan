import { render }  from 'react-dom';
import UserApi from "api/user"
import React from "react"
import Modal from "components/generic/modal"
import Utils from "utils"
import {makeUrl, redirectTo, replaceUrl, A} from "routing"
var createReactClass = require('create-react-class');

var DangerZone = createReactClass({

    displayName: 'DangerZone',

    componentDidMount : function() {
        Utils.trackEvent("Usage", "User dangerzone viewed")
    },

    deleteUser : function(e)
    {
        e.preventDefault()
        var onSuccess = function(data){
            Utils.trackEvent('Usage', 'User deleted')
            this.setState({deleted : true})
            setTimeout(function(){redirectTo(makeUrl("/user/logout"))},2000)
        }.bind(this)

        UserApi.deleteUser(this.props.user.pk,onSuccess)
        this.setState({deleting:true})
    },

    confirmDeleteUser : function(e)
    {
        e.preventDefault()
        this.refs.deleteUserModal.open()
    },

    handleCancel: function(e) {
        e.preventDefault()
        this.refs.deleteUserModal.close()
    },

    getInitialState : function(){
        return {deleting : false}
    },

    render : function(){
    var content = <p>Do you really want to delete your account? This action cannot be undone!</p>

    if (this.state.deleted)
        content = <p>We are sorry to see you leave! You will be logged out now. Please take a minute, to fill out our feedback form, to tell us what can do better!</p>

    var deleteUserModal = <Modal
        ref="deleteUserModal"
        confirm={["Delete my account ",this.state.deleting ? React.DOM.i({className:"fa fa-refresh fa-spin"},'') : undefined]}
        cancel="Cancel"
        disabled={this.state.deleting}
        onCancel={this.handleCancel}
        onConfirm={this.deleteUser}
        title="Delete account">
            {content}
      </Modal>

      return <div className="content-box">
                {deleteUserModal}
                <div className="head">
                  <h3>Danger zone</h3>
                </div>
                <div className="body clearfix">
                  <p className="form-info"><strong>Warning:</strong> If you delete your account, all historical analyses will be lost. This cannot be undone.</p>
                    <A className="pull-left btn btn-danger"
                       onClick={this.confirmDeleteUser}>
                           <i className="fa fa-trash" /> Delete my account
                    </A>
                </div>
              </div>
    }

})

export default DangerZone
