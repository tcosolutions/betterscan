import { render }  from 'react-dom';
import React from "react"
import ProjectApi from "api/project"
import Settings from "settings"
import Helper from "components/generic/helper"
import Utils from "utils"
import {A} from "routing"
var createReactClass = require('create-react-class');

var Hooks = createReactClass({

    displayName: 'Hooks',

    componentDidMount : function() {
        Utils.trackEvent("Usage", "PS: Hooks viewed")
    },

    render : function(){

        var helper = <Helper>
            <p>Send a HTTP request (POST / GET will work) to this URL to trigger an analysis of your project.</p>
            <p>You can use this add e.g. as a commit hook on Github to automatically analyze your project after each push.
               For projects that you add through the "Github" tab, such a commit hook will be automatically created.
               </p>
               <p>
               For more information about web hooks, check out the <A plain={true} href="https://help.github.com/articles/about-webhooks/">Github documentation</A>.
               </p>
        </Helper>
        return <div className="content-box">
                <div className="head">
                    <h3>Repository hooks</h3>
                </div>
                <div className="body clearfix">
                    <div className="row">
                        <div className="col-xs-12">
                            <h4>Analysis hook {helper}</h4>
                            <pre className="form-control">
                                <code>{Settings.backend_url+"/v1/project/"+this.props.project.pk+'/analyze'}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
    }
})

export default Hooks
