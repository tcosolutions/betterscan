/*
 * This file is part of Betterscan CE (Community Edition).
 *
 * Betterscan is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Betterscan is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Betterscan. If not, see <https://www.gnu.org/licenses/>.
 *
 * Originally licensed under the BSD-3-Clause license with parts changed under
 * LGPL v2.1 with Commons Clause.
 * See the original LICENSE file for details.
*/
//This script configures require js and bootstraps the application

//require.js will be concatenated with this file
//using the Makefile so that the resulting boot.js
//is the only JS file required to bootstrap the app.

require.config({
  paths: {
    "plugins" : 'empty:', //plugins are provided via Flask (see app.py)
    "env_settings" : 'empty:', //these settings get provided via Flask (see app.py)
    "text" : "../assets/js/text",
    "require" : "../bower_components/requirejs/requirejs",
    "jquery" : "../bower_components/jquery/dist/jquery",
    "bootstrap" : "../bower_components/bootstrap/dist/js/bootstrap",
    "moment" : "../bower_components/momentjs/moment",
    "director" : "../bower_components/director/build/director",
    "react": "../bower_components/react/react",
    "codemirror" : "../bower_components/codemirror",
    "sprintf" :"../bower_components/sprintf/src/sprintf",
    "marked":"../bower_components/marked/lib/marked",
    "prism":"../bower_components/prism/prism"
  },
  shim : {
    "director" : {
        exports : 'Router'
    },
    "bootstrap" : {
        deps : ['jquery'],
        exports : "Bootstrap",
    },
    "prism" : {
        exports : 'Prism'
    },
    "d3" : {
        exports : "d3"
    },
    "threejs" : {
        exports : "THREE"
    },
    "marked" : {
        exports : 'marked'
    }
  },
  baseUrl : "/static/js",
  urlArgs: "bust=BUILD_TIMESTAMP"
})
