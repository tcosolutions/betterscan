"""
This file is part of Betterscan CE (Community Edition).

Betterscan is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Betterscan is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Betterscan. If not, see <https://www.gnu.org/licenses/>.

Originally licensed under the BSD-3-Clause license with parts changed under
LGPL v2.1 with Commons Clause.
See the original LICENSE file for details.

"""
import re

def get_file_content_by_sha(project, sha, error_handling="ignore"):
    try:
        binary_content = project.git.repository.get_file_content_by_sha(sha)
        #file_coding_regex = re.compile(b"^[^\n]*\n?[^\n]*coding[:=]\s*([-\w.]+)")
        file_coding = "utf-8"  # per PEP 3120
        #file_coding_match = file_coding_regex.match(binary_content)
        #if file_coding_match:
         #   file_coding = file_coding_match.group(1).decode("ascii")
        return binary_content.decode(file_coding, error_handling)
    except BaseException as be:
        raise IOError(str(be))
