import { render }  from 'react-dom';
import React from "react"
import {makeUrl, A} from "routing"
var createReactClass = require('create-react-class');

var Tabs = createReactClass({
  displayName: 'Tabs',

  getDefaultProps: function (){
      return {tabs : [], activeTab : '', classes : 'tabs', onClick: function(){return true;}}
  },

  render: function() {
      var tabLinks = this.props.tabs.map(function(tab){
          var active = tab.name == this.props.activeTab
          var onClick = function(title, e){
              e.tabTitle = title
              if (e.button != 0 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)
                return
              if (active && !tab.activeHref) {
                e.preventDefault()
              }
              if (tab.onClick !== undefined)
                  return tab.onClick(e)
              return this.props.onClick(e)
          }.bind(this, tab.title)
          var href = tab.href
          var classNames = []
          if(active) {
            classNames.push("active")
            if(tab.activeHref) href = tab.activeHref
          }
          if(tab.disabled) {
            href = null
            classNames.push("disabled")
          }
          return <li key={tab.name} className={classNames.join(" ")} data-tab-name={tab.name}>
                    <A href={href} onClick={onClick}>{tab.title}</A>
                </li>
      }.bind(this))

    return <ul className={this.props.classes}>
        {tabLinks}
    </ul>
  },

})


var TabsMixin = {

  setupTabs: function(tabs, initial_tab, classes) {
    this.tabs = tabs
    this.classes = classes
    this.tabsByName = {}
    for(var i in this.tabs){
        this.tabsByName[this.tabs[i].name] = this.tabs[i]
    }
    var tabParam = this.tabParam || 'tab'
    for (var i = 0; i < this.tabs.length; i++) {
        if (!this.tabs[i].href) {
            var params = {}
            params[tabParam] = this.tabs[i].name
            this.tabs[i].href = makeUrl(this.props.baseUrl,params,this.props.params)
      }
    }
    this.validTabs = {}
    for (var i in tabs){
        var tab = tabs[i]
        this.validTabs[tab.name] = true
    }
    if (this.isValidTab())
        this.activeTab = this.getCurrentTabName()
    else
        this.activeTab = initial_tab
  },

  getTabs : function(){
      return <Tabs tabs={this.tabs}
          activeTab={this.activeTab}
          classes={this.classes} />
  },

  getCurrentTabName : function(){
    if (this.tabName)
        return this.tabName()
    return this.props.params !== undefined ? this.props.params[this.tabParam || 'tab'] : undefined
  },

  getCurrentTabContent: function() {
    if (this.activeTab !== undefined && this.tabsByName[this.activeTab] !== undefined)
        return this.tabsByName[this.activeTab].content
    return undefined
  },

  getCurrentTabTitle: function() {
    if (this.activeTab !== undefined && this.tabsByName[this.activeTab] !== undefined)
        return this.tabsByName[this.activeTab].title
    return undefined
  },

  isValidTab: function() {
    var tabParam = this.tabParam || 'tab'
    return this.getCurrentTabName() in this.tabsByName
  }
}

export default TabsMixin
