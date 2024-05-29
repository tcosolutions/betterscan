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
def metricsuffix(value):
    """
    formats a number by adding metric suffixes
    """
    suffixes = ["", "k", "M", "G", "T", "E"]
    value = float(value)
    for suffix in suffixes:
        if value < 1000:
            break
        value /= 1000
    # only display a decimal place if there is just one leading digit
    number_format = "{0:.1f}" if value < 10 else "{0:.0f}"
    # do not display trailing ".0"
    number_str = number_format.format(value)
    if len(number_str) >= 3 and number_str[-2:] == ".0":
        number_str = number_str[:-2]
    return number_str + suffix
