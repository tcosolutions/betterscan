import ProjectApi from "git/api/project"
import React from "react"
import FormMixin from "components/mixins/form"
import Utils from "utils"

var GitSettings = React.createClass({

    displayName: 'GitSettings',

    mixins: [FormMixin],

    statics: {
      isApplicable: function (project) {
        return ["admin","owner"].some(role => project.user_role == role) && project.source == 'git'
      }
    },

    getInitialState: function(){
        var state = {fetchRemoteFailed: false};
          state['url'] = this.props.project.git.url,
          state['privatekey'] = this.props.project.git.private_key
        return state;
    },

    componentDidMount : function() {
        Utils.trackEvent("Usage", "PS: Git settings viewed");
    },

    setURL: function(e){
        this.setState({url: e.target.value});

        
    },
    setSSHKEY: function(e){
        this.setState({privatekey: e.target.value});
    },



    submitForm: function(e){
        e.preventDefault();

        if (!this.validate())
            return;

        var onSuccess = function(data){
            this.setState({disabled : false})
            if (this.props.onChange !== undefined)
                this.props.onChange()
        }.bind(this)

        var onError = function(xhr,status,e){
            this.setState({disabled : false})
            this.parseApiErrorData(xhr.responseJSON)
        }.bind(this);

        this.disable();

        ProjectApi.update(this.props.project.pk,{overwrite : true,fetch : true,name : 'origin',url : this.state.url, private_key: this.state.privatekey},onSuccess,onError);
    },

    render : function(){
        var project = this.props.project
        var git = this.props.project.git
        var url_input = <input className="form-control"
                              id="url"
                              placeholder="git@github.com/<username>/<repo>.git"
                              defaultValue={git.url || ''}
                              required="true"
                              autofocus="true"
                              onChange={this.setter('url')}
                              disabled={this.state.disabled}/>
        var key_input = <textarea className="form-control"
                              id="privatekey" 
                              defaultValue={git.private_key || ''}
                              onChange={this.setSSHKEY}
                              disabled={this.state.disabled}/>
       

    
        var fetchStatus = <div className="col-xs-12"><p className="alert alert-info">It seems that we have not fetched this repository yet...</p></div>;

        if (project.fetched_at !== undefined){
            if (project.fetch_status === 'failed') {
                fetchStatus = <div className="col-xs-12"><div className="alert alert-warning">
                                <p>
                                    We cannot fetch the repository at the given URL.
                                </p>
                                <p>Please make sure that the URL is correct and that you installed the required SSH certificate.</p>
                                <pre>
                                  <code>{project.fetch_error}</code>
                                </pre>
                              </div></div>
            } else if (project.fetch_status === 'succeeded') {

                fetchStatus = <div className="col-xs-12">
                                <div className="alert alert-success">
                                  <p className="space-bottom-20">
                                      We successfully fetched this repository on <strong>{project.fetched_at}</strong>.
                                  </p>
                                </div>
                              </div>;
            } else {
                fetchStatus = <div className="col-xs-12">
                                <div className="alert alert-success">
                                  <p className="space-bottom-20">
                                      We never fetched this project so far.
                                  </p>
                                </div>
                              </div>;
            }
        }

        return <div className="content-box">
                <div className="head">
                    <h3>Git Settings</h3>
                </div>
                <div className="body clearfix">
                    <div className="row">
                        <div className="col-xs-12">
                             <form ref="form" id="remote_form" className="form-horizontal" role="form">
                                {this.formatErrorMessage('url')}
                                {this.formatErrorMessage('key')}
                                
                              <div className="form-group">
                                <div className="col-xs-12">
                                  <label htmlFor="url">URL</label>
                                  {this.formatFieldError('url')}
                                  {url_input}
                                </div>
                                {fetchStatus}
                                <div className="col-xs-12">
                                    <p>If you use SSH to access your repository, please add the following public key:</p>
                                    <pre><code>{git.public_key}</code></pre>
                                    <label htmlFor="privatekey">PRIVATEKEY</label>
                                    {this.formatFieldError('key')}
                                    {key_input}
                                </div>
                              </div>
                              <button disabled={this.state.disabled} className="btn btn-primary" onClick={this.submitForm} type="submit">
                                Update {this.state.disabled ? <i className="fa fa-refresh fa-spin"/>: ''}
                              </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>;
    }
});

export default GitSettings
