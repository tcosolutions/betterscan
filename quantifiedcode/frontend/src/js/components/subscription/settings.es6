import { render }  from 'react-dom';
import React from "react"
import {makeUrl} from "routing"
import Sidebar from "components/generic/sidebar"
import FormMixin from "components/mixins/form"
import LoaderMixin from "components/mixins/loader"
import TabsMixin from "components/mixins/tabs"
import SubscriptionApi from "api/subscription"
import UserSubscription from "./settings/_user_subscription"
import Settings from "settings"
import apis from "api/all"
var createReactClass = require('create-react-class');

var UserSubscriptionSettings= createReactClass({
    displayName: "UserSubscriptionSettings",

    mixins: [FormMixin, TabsMixin, LoaderMixin],

    resources: function (props) {
      return [
        {
          name: 'subscription',
          endpoint: SubscriptionApi.getUserSubscriptions,
          params: [{}]

        }
      ]
    },

    render: function () {

      var props = this.props,
          state = this.state

      var data = this.state.data
     
       
      var plansdescr1 = 
   
          {
      'id' :  "dummy",
      'interval': "month",
      'name': "Commercial Plan",
      'description': "No limites",
      'max_private_projects': 100,
      'price': 990
     }
 
   
 


      var tabs = [
        {
          name: 'user_subscription',
          title: 'User Subscription',
          href: makeUrl(props.baseUrl, {tab: 'user_subscription'}),
          content: <UserSubscription plans={plansdescr1}  {...props} />
        }
      ]



      var providers = Settings.providers['subscription.settings'] || []

      providers
        .forEach(function (provider) {
          tabs.push({
            name: provider.name,
            title: provider.title,
            href: makeUrl(props.baseUrl, {tab: provider.name}),
            content: <provider.component app={props.app} onChange={this.reloadResources} {...props} />
          })
        }.bind(this))


      this.setupTabs(tabs, 'user_subscription')

      var sidebarContent = (
        <div className="box tab-box default">
          <div className="head">
            <h4 className="settings-header">Settings</h4>
          </div>
          <div className="body clearfix">
            {this.getTabs()}
          </div>
        </div>
      )

      return (
        <div id="user-settings">
          <div className="row">
            <div className="col-xs-12 col-sm-3">
              <Sidebar>{sidebarContent}</Sidebar>
            </div>
            <div className="col-xs-12 col-sm-9">
              {this.getCurrentTabContent()}
            </div>
          </div>
        </div>
      )
    }

})

export default UserSubscriptionSettings
