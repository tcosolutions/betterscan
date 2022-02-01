import { render }  from 'react-dom';
import settings from "settings"
import $ from "jquery"
var accessToken
var requestCount = 0
var requestEndpoints = {}
var ongoingRequests = {}
var requestData = {}
var requestNotifiers = []

export default {

    uuid: function () {
        /*jshint bitwise:false */
        var i, random
        var uuid = ''

        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-'
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
            .toString(16)
        }

        return uuid
    },

    toUrlParams : function(params) {
        var urlParams
        if (params !== undefined)
            urlParams = $.param(params,{traditional:true})
        else
            urlParams = ''
        return urlParams
    },

    contains : function(array,value){
        for (var i in array) {
            if (array[i] === value)
                return true
        }
        return false
    },

    union : function(array1,array2){
        var d = {}
        var array = []

        function add_to_array(a){
            if (!a)
                return
            for(var i in a){
                var e = a[i]
                if (!(e in d)){
                    d[e] = 1
                    array.push(e)
                }
            }
        }
        add_to_array(array1)
        add_to_array(array2)

        return array
    },

    subtract : function(array1,array2){
        var d = {}
        var array = []

        for(var i in array2){
            d[array2[i]] = true
        }
        for(var i in array1){
            if (!(array1[i] in d))
                array.push(array1[i])
        }

        return array
    },

    pluralize: function (count, word) {
        return count === 1 ? word : word + 's'
    },

    updateAccessToken: function() {
        var cookie = document.cookie
        var regex = /(?:^|;)\s*access_token\s*=\s*([^;]*)/
        var match = cookie.match(regex)
        if(match) {
          accessToken = match[1].replace(/^\s+|\s+$/g, '')
        } else {
          accessToken = ""
        }
    },

    accessToken: function() {
        return accessToken
    },

    getFromCache : function(url){
        var key = "cache_"+url
        var cache = this.store(key)
        if (cache !== undefined){
            if (cache[1]+cache[2] >= (new Date()).getTime())
                return cache
            else{
                //expired...
                this.delete(key)
            }
        }
        return undefined
    },

    removeFromCache : function(url){
        var key = "cache_"+url
        this.remove(key)
    },

    storeToCache : function(url,data,validity){
        //default cache validity: 1 hour
        validity = (typeof validity === "undefined") ? settings.cacheValidity : validity
        var key = "cache_"+url
        var cache = this.store(key)
        var cacheUrls = this.store("cache_urls") || []
        if (cache === undefined)
        {
            cacheUrls.push(key)
        }

        cache = [data,(new Date()).getTime(),validity*1000]

        while(true){
            try{
                this.store(key,cache)
                this.store("cache_urls",cacheUrls)
                break
            }
            catch(e){
                if (cacheUrls.length == 0)
                    break
                var firstUrl = cacheUrls[0]
                cacheUrls.splice(0,1)
                this.delete(firstUrl)
            }
        }
    },

    requestData : function(requestId){
        return requestData[requestId]
    },

    addRequestNotifier : function(notifier){
        if (!(notifier in requestNotifiers))
            requestNotifiers.push(notifier)
    },

    removeRequestNotifier : function(name,notifier){
        if (notifier in requestNotifiers)
            requestNotifiers.splice(requestNotifiers.indexOf(notifier),1)
    },


    apiRequest: function(data,opts){

        if (opts === undefined)
            opts = {}

        var authenticated = (typeof opts.authenticated === "undefined") ? true : opts.authenticated
        var cached = (typeof opts.cached === "undefined") ? true : opts.cached

        var fullData
        var requestId = requestCount++

        if (authenticated && this.accessToken())
        {
            //If this is an authenticated request, we add the authorization header
            fullData = $.extend($.extend({},data),{
                url : settings.source+data.url,
                beforeSend: function (xhr) {
                   xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
                   xhr.setRequestHeader ("Authorization", "Bearer "+this.accessToken())
               }.bind(this)})
        }
        else{
            fullData = $.extend($.extend({},data),{
               url : settings.source+data.url,
               beforeSend : function(xhr){
                   xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
               }.bind(this)})
        }
        //We overwrite the success/error handlers so that we can inform the request notifier about the status of the request.

        for(var i in requestNotifiers){
            var requestNotifier = requestNotifiers[i]
            requestNotifier.register(requestId,fullData)
        }

        var statusSuccessHandler = function(requestId,originalHandler,data){
            for(var i in requestNotifiers){
                var notifier = requestNotifiers[i]
                notifier.success(requestId,data)
            }
            if (originalHandler !== undefined){
                return originalHandler($.extend({'__requestId__' : requestId},data))
            delete requestData[requestId]
            }
        }.bind(this,requestId,fullData.success)

        var statusErrorHandler = function(requestId,originalHandler,xhr,data,e){
            for(var i in requestNotifiers){
                var notifier = requestNotifiers[i]
                notifier.error(requestId,xhr,data,e)
            }
            if (originalHandler !== undefined)
                return originalHandler(xhr,$.extend({'__requestId__' : requestId}.data),e)
            delete requestData[requestId]
        }.bind(this,requestId,fullData.error)

        fullData.error = statusErrorHandler
        fullData.success = statusSuccessHandler

        if (fullData.type == 'GET')
        {
            var makeCall = true
            if (ongoingRequests[fullData.url] !== undefined){
                ongoingRequests[fullData.url].callbacks.push({success : fullData.success,error : fullData.error})
                makeCall = false
            }
            else{
                ongoingRequests[fullData.url] = { callbacks : [{success :fullData.success,error : fullData.error}]}
                var onSuccess = function(data){
                    if (ongoingRequests[fullData.url] === undefined){
                        return
                    }
                    for(var i=0;i<ongoingRequests[fullData.url].callbacks.length;i++){
                        var callbacks = ongoingRequests[fullData.url].callbacks[i]
                        if (callbacks.success !== undefined)
                            callbacks.success(data)
                    }
                    if (data['__cached__'] === undefined){
                        delete ongoingRequests[fullData.url]
                    }
                }.bind(this)

                var onError = function(xhr,data,e){
                    if (ongoingRequests[fullData.url] === undefined)
                        return
                    for(var i=0;i<ongoingRequests[fullData.url].callbacks.length;i++){
                        var callbacks = ongoingRequests[fullData.url].callbacks[i]
                        if (callbacks.error !== undefined)
                            callbacks.error(xhr,data,e)
                    }
                    delete ongoingRequests[fullData.url]
                }.bind(this)

                fullData.success = onSuccess
                fullData.error = onError
            }

            if (cached && settings.useCache){
                //if the cache is activated and this is a GET request, do the caching magic

                var originalOnSuccess = fullData.success
                var originalOnError = fullData.error
                var url = fullData.url
                var cachedData = this.getFromCache(url)
                if (cachedData !== undefined && cachedData[0] !== undefined){
                    fullData['ifModified'] = true
                    if (originalOnSuccess){
                        var cd = $.extend($.extend({},cachedData[0]),{'__requestId__' : requestId,'__cached__' : true})
                        originalOnSuccess(cd)
                    }
                }

                var onSuccess = function(url,cachedData,onSuccess,newData,status,xhr){
                    //if the data is unmodified, we retrieve it from the cache instead...
                    if (status == 'notmodified')
                        newData = cachedData[0]
                    else
                        newData = $.extend({'__etag__' : xhr.getResponseHeader('etag')},newData)
                    if (onSuccess)
                        onSuccess(newData)
                    this.storeToCache(url,newData)
                }.bind(this,url,cachedData,originalOnSuccess)

                var onError = function(url,cachedData,onError,xhr,status,e){
                    if (cachedData !== undefined)
                        this.removeFromCache(url)
                    if (onError)
                        onError(xhr,status,e)
                }.bind(this,url,cachedData,originalOnError)

                fullData.success = onSuccess
                fullData.error = onError
            }
            if (!makeCall)
                return requestId
        }

        requestData[requestId] = {data : fullData, opts : opts}
        $.ajax(fullData)

        return requestId
    },

    logout: function(){
        if (window.ga !== undefined){
            ga('set', { userId: undefined })
        }
        sessionStorage.clear()
        this.updateAccessToken()
    },

    login: function(user) {
        // we clear the local storage to make sure no information about
        // other users is present
        sessionStorage.clear()
        if (window.ga !== undefined && user !== undefined){
            ga('set', { userId: user.pk })
        }
        this.updateAccessToken()
    },

    isLoggedIn: function(){
        return this.accessToken() != '' ? true : false
    },

    remove : function(namespace){
        sessionStorage.removeItem(namespace)
    },

    store: function (namespace, data) {
        if (data !== undefined) {
            return sessionStorage.setItem(namespace, JSON.stringify(data))
        }

        var store = sessionStorage.getItem(namespace)
        return (store && JSON.parse(store)) || undefined
    },

    delete: function(namespace){
        sessionStorage.removeItem(namespace)
    },

    truncate: function(str,n,useWordBoundary){
        var toLong = str.length>n,
        s_ = toLong ? str.substr(0,n-1) : str
        s_ = useWordBoundary && toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_
        return  toLong ? s_ + '...' : s_
    },

    truncateInMiddle: function(str,n){
        var toLong = str.length>n+2,
            s_ = toLong ? (str.substr(0,(n-1)/2) + "..." +str.substr(-(n-1)/2)): str
        return  s_
    },

    replaceUnderscoreBySpace: function(str) {
       return str.replace("_", " ")
    },

    capitalizeFirstChar: function(str) {
       return str.charAt(0).toUpperCase() + str.slice(1)
    },

    addThousandSeparator: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    },

    getGravatar: function(email, size) {
        // MD5 (Message-Digest Algorithm) by WebToolkit
        var MD5=function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()}

        var size = size || 80

        return 'http://www.gravatar.com/avatar/' + MD5(email) + '.jpg?s=' + size
    },

    //see: https://developers.google.com/analytics/devguides/collection/analyticsjs/events
    trackEvent: function(category, action, data) {
        if(!data) data = {}
        if (window.ga !== undefined){
          // Set optional parameters
          var label = data.label || ''
          // value must be a number
          var value = data.value || 1
          window.ga('send', 'event', category, action, label, value)
        }
    },
}
