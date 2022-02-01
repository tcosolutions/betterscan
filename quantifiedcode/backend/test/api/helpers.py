

from quantifiedcode.backend.app import get_app
from quantifiedcode.test.helpers import ApplicationTest


class ApiTest(ApplicationTest):

    """
    An API test setups up the database (using the DatabaseTest) and launches a process
    that provides a fully functional API server on the local host.

    This process answers the API requests issued by the tests, using the database
    set up by DatabaseTest. This process will be set up only once for each test
    in a given class to save time.
    """

    fixtures = []
    host = 'localhost'
    port = 5555
    protocol = 'http'
    get_app = staticmethod(get_app)
    base_url = '/v1'

    recreate_db = False
    create_db = True
    delete_data = True
