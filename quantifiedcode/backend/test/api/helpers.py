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
