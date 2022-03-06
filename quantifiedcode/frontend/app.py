from flask import (Flask,
                   make_response,
                   redirect,
                   render_template,
                   request,
                   Blueprint,
                   abort,
                   send_from_directory,
                   redirect)

from ..settings import settings, backend
from .utils import StaticFilesFlask

import os
import math
import urllib.request, urllib.parse, urllib.error
from datetime import date

context = {
    'active_page' : '',
}

def get_app(settings):

    debug = settings.get('debug')


    static_folder = os.path.join(settings.get('frontend.path'),
                                 settings.get('frontend.static_folder') if debug else
                                 settings.get('frontend.optimized_static_folder')
                                 )

    #we subclass the Flask class to add more than one directory for static files
    app = StaticFilesFlask(
        __name__,
        static_url_path=settings.get('frontend.static_url'),
        static_folder=static_folder,
        template_folder=os.path.join(settings.get('frontend.path'),
                                     settings.get('frontend.template_folder')),
    )

    webapp_context = {
        'DEBUG' : debug,
        'website_title' : settings.get('website_title','QuantifiedCode'),
        'static_url' : '{}{}'.format(settings.get('frontend.url'), settings.get('frontend.static_url')),
        'app_url' : settings.get('frontend.app_url')
    }

    @app.errorhandler(404)
    def redirect_to_index(e):
        #todo: we should display a normal 404 page instead of a redirect, since redirecting
        #can yield to errors and hard-to-debug output with e.g. missing JS files...
        context['error'] = e
        return render_template("404.html", **context), 404

    @app.route('{}/js/boot.js'.format(settings.get('frontend.static_url')))
    def boot_js():
        """
        Returns the main JS file required to run the frontend.

        For the development version, this just returns the config.js and the environment as well
        as plugin settings. All other modules will then be loaded separately.

        For the production version, this concatenates the plugin boot scripts, the main boot script,
        and all settings files.
        """

        def read_file(filename):
            with open(filename,'r') as input_file:
                return input_file.read()

        settings_context = context.copy()
        settings_context['url'] = settings.get('frontend.url')
        env_settings = render_template("settings.js", **settings_context)

        plugins_context = {'plugin_modules' : [], 'plugins' : {}}

        #we add the plugin settings
        for plugin in settings.get('plugins'):
            plugin_config = settings.load_plugin_config(plugin)
            if plugin_config.get('frontend') and plugin_config['frontend'].get('settings'):
                plugins_context['plugins'][plugin] = plugin_config['frontend']['settings']
                plugins_context['plugin_modules'].append(plugin_config['frontend']['settings']['settingsModule'])

        #we add the settings modules of the plugins to the require list for the core settings
        plugins_context['plugin_modules'] = ','.join(['"{}"'.format(module)
                                                      for module in plugins_context['plugin_modules']])
        plugin_settings = "\n"+render_template("plugins.js", **plugins_context)

        #debug = 1;
        if debug:
            content = "\n".join([
                read_file(os.path.join(static_folder,'bower_components/requirejs/require.js')),
                read_file(os.path.join(static_folder,'js/config.js')),
                read_file(os.path.join(static_folder,'bower_components/react/react.js')),
                env_settings,
                plugin_settings,
                '\nrequire(["main"],function(main){});\n'
            ])
        else:
            plugin_boot_scripts = ""
            for plugin in settings.get('plugins'):
                plugin_config = settings.load_plugin_config(plugin)
                if plugin_config.get('frontend') and plugin_config['frontend'].get('optimized_static_files'):
                    plugin_boot_scripts += read_file(os.path.join(plugin_config['frontend']['optimized_static_files'],'js/boot.min.js'))

            content = "\n".join([
                read_file(os.path.join(static_folder,'js/require.min.js')),
                plugin_boot_scripts,
                env_settings,
                plugin_settings,
                read_file(os.path.join(static_folder,'js/boot.min.js'))
            ])

        response = make_response(content)
        response.mimetype = 'application/javascript'
        return response
 
    @app.route('/git/settings.js')
    def git_settings_js():
        def read_file(filename):
          with open(filename,'r') as input_file:
            return input_file.read()
      
        content = read_file('/srv/scanmycode/quantifiedcode/plugins/git/frontend/build/static/js/git/settings.js')
        
        response = make_response(content)
        response.mimetype = 'application/javascript'
        return response

    @app.route('/project/git/settings.js')
    def project_settings_js():
        def read_file(filename):
          with open(filename,'r') as input_file:
            return input_file.read()

        content = read_file('/srv/scanmycode/quantifiedcode/plugins/git/frontend/build/static/js/git/settings.js')

        response = make_response(content)
        response.mimetype = 'application/javascript'
        return response


    @app.route('/project/git/<path:path>')
    def send_js1(path):
      return send_from_directory('/srv/scanmycode/quantifiedcode/plugins/git/frontend/build/static/js/git', path)

    @app.route('/user/git/<path:path>')
    def send_js2(path):
      return send_from_directory('/srv/scanmycode/quantifiedcode/plugins/git/frontend/build/static/js/git', path)




    @app.route('/git/<path:path>')
    def send_js(path):
      return send_from_directory('/srv/scanmycode/quantifiedcode/plugins/git/frontend/build/static/js/git', path)
    

    @app.route('/',defaults = {'path' : ''})
    @app.route('/<path:path>')
    def webapp(path):
        return make_response(render_template("app.html", **webapp_context))

    configure(app, settings)
    return app

def configure(app, settings):
    debug = settings.get('debug')
    app.config.update(DEBUG = debug)
    app.secret_key = settings.get('frontend.secret_key')
    for plugin_name in settings.get('plugins',{}):
        config = settings.load_plugin_config(plugin_name)
        if debug:
            #in development, we include non-optimized files
            if config.get('frontend') and config['frontend'].get('static_files'):
                app.add_static_folder(config['frontend']['static_files'])
        else:
            #for a production version, we include only optimized files
            if config.get('frontend') and config['frontend'].get('optimized_static_files'):
                app.add_static_folder(config['frontend']['static_files'])

if __name__ == '__main__':
    app = get_app(settings)
    app.run(debug=debug, host='0.0.0.0', port=8000,threaded = False)
