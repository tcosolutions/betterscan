import { render }  from 'react-dom';
import plugins from "plugins"
import Settings from "settings"
import {register} from "routing"
import $ from "jquery"

export function loadPlugins(render){
  for(var name in plugins){
    console.log(name)
    var pluginSettings = plugins[name]
    //the settings module should've been required before via the dynamically generated settings.js file
    var settingsModule = require(pluginSettings.settingsModule)
    if (settingsModule && settingsModule.__esModule == true)
        settingsModule = settingsModule.default
    for(var providerName in settingsModule.providers){
        if (Settings.providers[providerName] !== undefined)
            Settings.providers[providerName].push(...settingsModule.providers[providerName])
    }
    if (settingsModule.sourceSettings !== undefined){
        $.extend(Settings.sourceSettings, settingsModule.sourceSettings)
    }
    if (settingsModule.setUp !== undefined){
      settingsModule.setUp()
    }
        var pluginRoutes = settingsModule.routes
        register(render, pluginRoutes)
  }
}
