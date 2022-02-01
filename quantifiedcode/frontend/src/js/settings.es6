import { render }  from 'react-dom';
import baseSettings from "base_settings"
import envSettings from "env_settings"
import $ from "jquery"
//import {register, initialize} from "routing"

/*
The env_settings module gets generated dynamically by the boot.js file
generated in app.py and will contain the settings for the different plugins,
as well as require calls to their settings modules. This enables us to
dynamically enable/disable the plugin code without recompiling a single
line of frontend code.
*/

var settings = {
    source: '/api/v1',
    useCache: true,
    callbacks: {},
    cacheValidity: 60, //cache expires after 60 seconds,
    providers : {
      'project.new' : [],
      'project.new.urlChecker' : [],
      'project.details' : [],
      'project.settings' : [],
      'project.header.info' : [],
      'project.header.description' : [],
      'project.header.fetchStatus' : [],
      'project.snapshot' : [],
      'projects.links' : [],
      'login': [],
      'signup': [],
      'user.settings.linked_accounts': [],
      'user.settings': [],
      'subscription.settings': [],
      'github.settings': []
    },
    sourceSettings: {
      git: {
        editNameDisabled: false,
        editDescriptionDisabled: false,
        editPrivacyDisabled: false
      }
    },
    getSource: function(project){
        return project.source
    }
}


export default $.extend($.extend($.extend({}, baseSettings), settings),envSettings)
