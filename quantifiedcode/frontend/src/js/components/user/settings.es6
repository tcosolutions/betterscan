import { render }  from 'react-dom';
import $ from "jquery"
import React from "react"
import {makeUrl} from "routing"
import Sidebar from "components/generic/sidebar"
import FormMixin from "components/mixins/form"
import LoaderMixin from "components/mixins/loader"
import TabsMixin from "components/mixins/tabs"
import ChangeEmail from "./settings/_change_email"
import UserApi from "api/user"
import ChangePassword from "./settings/_change_password"
import LinkedAccounts from "./settings/_linked_accounts"
import DangerZone from "./settings/_danger_zone"
import Settings from "settings"
var createReactClass = require('create-react-class');

var UserSettings = createReactClass({
    displayName: "UserSettings",

    mixins: [FormMixin, TabsMixin, LoaderMixin],

    resources: function (props) {
      return [
        {
          name: 'user',
          endpoint: UserApi.getUser,
          params: [{}]
        },
      ]
    },

    render: function () {

      var props = this.props,
          state = this.state

      var data = this.state.data


      var tabs = [
        {
          name: 'linked_accounts',
          title: 'Linked accounts',
          href: makeUrl(props.baseUrl, {tab: 'linked_accounts'}),
          content: <LinkedAccounts user={data.user} onChange={this.reloadResources} disabled={state.disabled} />
        }
      ]

      var providers = Settings.providers['user.settings'] || []
      console.log(providers);

      providers
        .forEach(function (provider) {
          tabs.push({
            name: provider.name,
            title: provider.title,
            href: makeUrl(props.baseUrl, {tab: provider.name}),
            content: <provider.component app={props.app} onChange={this.reloadResources} user={data.user} {...props} />
          })
        }.bind(this))

      tabs.push({
        name: 'change_email',
        title: 'Change email',
        href: makeUrl(props.baseUrl, {tab: 'change_email'}),
        content: <ChangeEmail app={this} baseUrl={props.baseUrl} params={props.params} onChange={this.reloadResources}
                              data={props.data} user={data.user}/>
      })
      tabs.push({
        name: 'change_password',
        title: 'Change password',
        href: makeUrl(props.baseUrl, {tab: 'change_password'}),
        content: <ChangePassword app={this} baseUrl={props.baseUrl} onChange={this.reloadResources}
                                 data={props.data} user={data.user}/>
      })
      tabs.push({
        name: 'danger_zone',
        title: 'Danger zone',
        href: makeUrl(props.baseUrl, {tab: 'danger_zone'}),
        content: <DangerZone onChange={this.reloadResources} user={data.user} data={props.data}/>
      })

      this.setupTabs(tabs, 'linked_accounts')

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

export default UserSettings
