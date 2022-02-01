import { render }  from 'react-dom';
import React from "react"
import Settings from "settings"
import LoaderMixin from "components/mixins/loader"
import Utils from "utils"
var createReactClass = require('create-react-class');

var LinkedAccounts = createReactClass({
    displayName: 'LinkedAccounts',

    componentDidMount: function(){
      Utils.trackEvent("Usage", "Linked accounts viewed")
    },

    render: function() {

      var props = this.props

      var accounts = []
      var providers = Settings.providers['user.settings.linked_accounts'] || []
      providers
        .forEach(function (provider) {
            
          accounts.push({
            name: provider.name,
            content : <provider.component {...props} />
          })
        })

      accounts = accounts.map(function (account) {
        return <div className="row">
          <div className="col-md-12">
            {account.content}
          </div>
        </div>
      })

      if (accounts.length == 0)
        accounts = <p className="alert alert-info">Seems you have no linked accounts.</p>

      return (
        <div className="content-box">
          <div className="head">
            <h3>Linked accounts</h3>
          </div>
          <div className="body clearfix">
            {accounts}
          </div>
        </div>
      )
    }
})

export default LinkedAccounts
