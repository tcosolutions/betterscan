import sys
import os
import argparse
import signal
import unittest
import flask
import time
import requests
import multiprocessing
import traceback

from multiprocessing.util import register_after_fork
from quantifiedcode.app import get_app
from quantifiedcode.settings import settings
from quantifiedcode.backend.models import User, AccessToken, Project

class ApplicationProcess(multiprocessing.Process):

    def __init__(self, host, port, get_app, queue):
        super(ApplicationProcess,self).__init__()
        self.host = host
        self.queue = queue
        self.port = port
        self.get_app = get_app

    def run(self):
        #we replace the engine getter, as the old one comes from another process
        try:
            settings.backend = None
            application = flask.Flask(__name__)
            application.wsgi_app = self.get_app(settings)
        except:
            traceback.print_exc()
            raise
        try:
            self.queue.put(True)
            application.run(
                debug=settings.get('debug',True),
                host=self.host,
                port=self.port,
                processes=1,
                use_reloader=False
            )
        except KeyboardInterrupt:
            print "Exiting..."

class DatabaseTest(unittest.TestCase):

    """
    :attribute        recreate_db: Completely recreate the database from scratch
    :attribute          create_db: Create all tables and triggers if they don't yet exist.
    :attribute        delete_data: Delete all data currently in the database.
    :atttribute            models: The models that are relevant for this test
                                   (only they will get deleted from the DB if specified).
    Normally, `create_db` and `delete_data` should be sufficient to ensure that the
    database is in a good state for running the tests.

    However, if the test database has been "messed up" by the user or a test, it should
    be reinitialized either manually or by using the `recreate_db` option.

    Manual reinitialization can be done via the `reinit-db` management command.
    """

    create_db = True
    delete_data = True
    recreate_db = False
    delete_data = True
    fixtures = []
    models = [AccessToken, User, Project]

    def setUp(self):
        self.backend = settings.backend
        if not TEST:
            raise AttributeError("You try to run tests in a non-TEST environment!")
        if self.recreate_db:
            settings.backend.drop_schema()
        if self.create_db or self.recreate_db:
            settings.backend.create_schema()
        if not self.recreate_db and self.delete_data:
            #we delete existing objects from the database...
            with settings.backend.transaction():
                for model in self.models:
                    settings.backend.filter(model,{}).delete()
        self._create_fixtures()

    def _create_fixtures(self):
        fixture_objs = {}
        for fixture_dict in self.fixtures:
            for key,fixture in fixture_dict.items():
                objs = fixture(self,fixture_objs)
                fixture_objs[key] = objs
                setattr(self,key,objs)

    def tearDown(self):
        """
        we delete the objects from the database to make sure other tests don't fail because of them...
        """
        with settings.backend.transaction():
            for model in self.models:
                settings.backend.filter(model,{}).delete()

class ApplicationTest(DatabaseTest):

    """
    """

    get_app = staticmethod(get_app)
    host = 'localhost'
    port = 5555
    protocol = 'http'
    base_url = ''

    recreate_db = False
    create_db = True
    delete_data = True

    def url(self,name):
        return '{}://{}:{}{}{}'.format(self.protocol,
                                       self.host,
                                       self.port,
                                       self.base_url,
                                       name)

    def setUp(self):
        settings.initialize()
        super(ApplicationTest,self).setUp()
        self.queue = multiprocessing.Queue()
        self.application_process = ApplicationProcess(self.host,self.port,self.get_app,self.queue)
        self.application_process.start()
        #this parameter might need some tuning to be sure the API is up when the tests start
        value = self.queue.get(True, 1.0)
        if not value:
            raise IOError("Problem starting application!")
        time.sleep(0.2)

    def tearDown(self):
        start = time.time()
        self.application_process.terminate()
        super(ApplicationTest, self).tearDown()

    def _authenticated_request(self, user, func, url, *args, **kwargs):
        access_token = user.access_tokens[0]
        headers = {
            'Authorization' : 'bearer {}'.format(access_token.token)
        }
        if 'headers' in kwargs:
            headers.update(kwargs['headers'])
            del kwargs['headers']
        return func(self.url(url), *args, headers = headers, **kwargs)

    def authenticated_get(self, user, *args, **kwargs):
        return self._authenticated_request(user, requests.get, *args, **kwargs)

    def authenticated_post(self, user, *args, **kwargs):
        return self._authenticated_request(user, requests.post, *args, **kwargs)

    def authenticated_delete(self, user, *args, **kwargs):
        return self._authenticated_request(user, requests.delete, *args, **kwargs)

    def authenticated_put(self, user, *args, **kwargs):
        return self._authenticated_request(user, requests.put, *args, **kwargs)

    def authenticated_patch(self, user, *args, **kwargs):
        return self._authenticated_request(user, requests.patch, *args, **kwargs)
