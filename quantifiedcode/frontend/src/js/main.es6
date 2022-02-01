import MainApp from "components/app"
import 'regenerator-runtime/runtime'
import "babel-polyfill" 
import NotFound from "components/not_found"
import React from "react"
import ReactDOM from 'react-dom';
import Utils from "utils"
import Settings from "settings"
import Plugins from "plugins"
import {loadPlugins} from "plugin_helpers"
import {register, initialize, getUrlParameters} from "routing"
import Routes from "routes"

//shim for String.startsWith
if (typeof String.prototype.startsWith != 'function'){
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str
  }
}
console.warn = function () {};
console.log = function () {};
console.error = function () {};
console.debug = function () {};

var app = undefined;
var appComponent = undefined;

function initApp(){
    appComponent = ReactDOM.render(app,
      document.getElementById('main')
    )
}

function render(props){

    if (props.params !== undefined)
    {
        props.stringParams = props.params.slice(1)
        props.params = getUrlParameters(props.params.slice(1))
    }
    else
        props.params = {}

    if (Settings.html5history){
        var re = new RegExp(Settings.appUrl+'(.*)$')
        var result = re.exec(window.location.pathname)
        if (result !== null)
          props.baseUrl = result[1]
        else
          props.baseUrl = '/'
    } else {
        var re = /^#(.*?)(\?.*)?$/i
        var result = re.exec(window.location.hash)
        if (result !== null)
            props.baseUrl = result[1]
        else
            props.baseUrl = '/'
    }

        app = React.createElement(MainApp,props)
        initApp()

       

}

if (!Settings.html5history){
    if (window.location.pathname != Settings.appUrl){ 
       window.location.pathname = Settings.appUrl
    }
    if (window.location.hash === ''){
        window.location.hash="#/"
    }
}
else{
    if (window.location.hash.substring(0,2) == '#/'){
        window.location = window.location.protocol+'//'+window.location.host+Settings.appUrl+window.location.hash.substring(1)
    }
}

//We initialize the settings (passing in the render function)
Utils.updateAccessToken()
register(Routes)
loadPlugins()
initialize(render)
