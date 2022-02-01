import Director from "director"
import React from "react"
import Utils from "utils"
import Settings from "settings"
import NotFound from "components/not_found"

//We add URL-style parameters to all routes by decorating the original handler function.
var routesWithParams = {}
var lastUrl
var lastUrlPattern
var router = new Director()
var callbacks = {}
var renderer

function generateCallBack(urlCallback, urlPattern, urlWithParams){

  return function(...args){

    var params = urlCallback.bind(this)(...args.slice(0, arguments.length-(Settings.html5history ? 0 : 1)))

    if (callbacks.onUrlChange && window.location.href != lastUrl){
      for(var i in callbacks.onUrlChange){
        var callback = callbacks.onUrlChange[i]
        if (callback(urlPattern,urlWithParams,window.location.href) == false){
          if (lastUrl)
            replaceUrl(lastUrl)
          return
        }
      }
    }

    if (Settings.html5history)
      params.params = window.location.search
    else
      params.params = arguments[arguments.length-1]

    var url = window.location.href
    params.url = url
    //update title & meta tags
    setTitle(params.title)
    setMetaTag("description", (params.metaTags || {}).description)
    setMetaTag("keywords", ((params.metaTags || {}).keywords || []).concat(Settings.globalKeyKeywords || []).join(","))
    //render the view
    renderer(params)
    //scroll to top if we navigated to a different page
    if(urlPattern !== lastUrlPattern) {
      document.documentElement.scrollTop = 0
    }
    //set lastUrl and lastUrlPattern
    lastUrl = url
    lastUrlPattern = urlPattern
  }
}

export function initialize(_renderer){

    renderer = _renderer

    router.configure({html5history : Settings.html5history,
                      notfound : function(){return renderer({component : NotFound, data : {}})},
                      strict : false })

    //We define the parameter format for the routes
    //todo: add customization for plugins
    router.param('projectId', /([\w\d\-\:\.]+)/)
    router.param('taskId', /([\w\d\-\:\.]+)/)
    router.param('teamId', /([\w\d\-\:\.]+)/)
    router.param('snapshotId', /([\w\d\-\:\.]+)/)
    router.param('branch', /([^\?]*)/)
    router.param('action', /([\w\d\-\:\.]+)/)
    router.param('path', /(.*)/)
    router.mount(routesWithParams)
    router.init()
}

export function register(routes) {
    for (var url in routes){
        var urlWithParams = url+'/?(\\?.*)?'
        if (Settings.html5history)
            urlWithParams = url
        var prefix = ''
        if (Settings.html5history)
            prefix = Settings.appUrl
        routesWithParams[prefix+urlWithParams] = generateCallBack(routes[url], url,urlWithParams)
    }
}

export function getUrlParameters(query)
{
    var params = {}
    var vars = query.split("&")
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=")
        pair = pair.map(decodeURIComponent)
        if (pair.length < 2)
            continue
        var key = pair[0],value = pair[1]
        if (value.indexOf(',') != -1)
            value = value.split(',')
        if (key in params)
        {
            if (Array.isArray(params[key])){
                if (Array.isArray(value))
                    params[key].push(...value)
                else
                    params[key].push(value)
            } else {
                if (Array.isArray(value)){
                    params[key] = [params[key]]
                    params[key].push(...value)
                }
                else
                    params[key] = [params[key],value]
            }
        }
        else
            params[key] = value
    }
    return params
}

export function makeUrlParameters(params){
    var strings = []
    for(var param in params){
        if (params[param] !== undefined){
            if (Array.isArray(params[param]) && params[param].length){
                var values = []
                for(var i in params[param])
                    values.push(encodeURIComponent(params[param][i].toString()))
                strings.push(param.toString()+'='+values.join(','))
            } else if (params[param] != '')
                strings.push(param.toString()+"="+encodeURIComponent(params[param].toString()))
        }
    }
    return strings.join("&")
}

export function addCallback(name,callback){
    if (callbacks[name] === undefined)
        callbacks[name] = []
    if (!Utils.contains(callbacks[name],callback))
        callbacks[name].push(callback)
}

export function redirectTo(url,hard){
    if (Settings.onRedirectTo)
        Settings.onRedirectTo(url)
    else{
        if (hard){
            window.location = url
            return
        }
        setTimeout(function(){router.setRoute(url);},100)
    }
}

export function removeCallback(name,callback){
    if (callbacks[name] && Utils.contains(callbacks[name],callback))
        callbacks[name].splice(callbacks[name].indexOf(callback),1)
}

export function setTitle(newTitle) {
  // Set page title
  var completeTitle = "Scanner"
  if(newTitle !== undefined && newTitle.length) {
    completeTitle = newTitle + " - " + completeTitle
  }
  document.title = completeTitle

  // Set title in open graph meta tag
  var element = document.querySelector('meta[property="og:title"]')
  //create element if it does not exist
  if(!element) {
    element = document.createElement("meta")
    var attribute = document.createAttribute("property")
    attribute.value = "og:title"
    element.setAttributeNode(attribute)
    document.getElementsByTagName("head")[0].appendChild(element)
  }
  element.content = completeTitle
}

export function replaceUrl(url){
    history.replaceState(null,null,url)
}

export function setMetaTag(tag, value, og) {
  og = og || false
  if(value) {
    // Set standard meta tags
    var element = document.querySelector('meta[name=' + tag + ']')
    //create element if it does not exist
    if(!element) {
      element = document.createElement("meta")
      element.name = tag
      document.getElementsByTagName("head")[0].appendChild(element)
    }
    element.content = value

    // Set OpenGraph properties
    // Be aware: the og:title tag is set using setTitle
    if (og == true) {
        var element = document.querySelector('meta[property="og:' + tag + '"]')
        //create element if it does not exist
        if(!element) {
          element = document.createElement("meta")
          var attribute = document.createAttribute("property")
          attribute.value = "og:" + tag
          element.setAttributeNode(attribute)
          document.getElementsByTagName("head")[0].appendChild(element)
        }
        element.content = value
    }

  } else {
    //remove tags which are not set
    if(og == true) {
        var oldElement = document.querySelector('meta[property="og:' + tag + '"]')
    } else {
        var oldElement = document.querySelector('meta[name=' + tag + ']')
    }
    if(oldElement) {
      oldElement.parentNode.removeChild(oldElement)
    }
  }
}

export function makeUrl(baseUrl,newParams,oldParams,unsetParams){
    var params = $.extend({},newParams)
    if (oldParams !== undefined)
        for (var param in oldParams){
            if (!(param in newParams))
                params[param] = oldParams[param]
        }
    if (unsetParams !== undefined) {
        for(var i in unsetParams){
            var param = unsetParams[i]
            if (params[param] !== undefined)
                delete params[param]
        }
    }
    var urlParams = makeUrlParameters(params)
    if (Settings.html5history)
        return (baseUrl.substr(0,4) !== 'http' ? Settings.appUrl : '')+baseUrl + (urlParams ? "?" + urlParams : "")
    else
        return '#' + baseUrl + (urlParams ? "?" + urlParams : "")
}

var createReactClass = require('create-react-class');

export let A = createReactClass({
    displayName: 'A',

    onClick: function(e){
        if (this.props.onClick !== undefined)
            this.props.onClick(e)
        if (e.isDefaultPrevented())
            return
        //only handle clicks with the left mouse button without any modifier keys
        //e.button is interally normalized by React.js across browsers
        if (e.button != 0 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)
            return
        if (this.props.href !== undefined && this.props.href.substr(0,4) !== 'http') {
            e.preventDefault()
            router.setRoute(this.props.href)
        }
    },

    render : function(){
        //prevent the link from being dragged around
        var props = $.extend({onDragStart: function(e) {e.preventDefault();}},this.props)
        if (this.props.plain){
            delete props.plain
        } else {
            props.onClick = this.onClick
        }
        return React.createElement('a',props,props.children)
    }
})
