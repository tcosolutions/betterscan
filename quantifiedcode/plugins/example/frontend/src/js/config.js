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
//all modules defined by the core application are explictly set to empty:
//this will keep require.js from complaining about them...

require.config({
  paths: {
      jquery: 'empty:',
      react: 'empty:',
      moment: 'empty:',
      'api/project' : 'empty:',
      'api/user' : 'empty:',
      'utils' : 'empty:',
      'settings' : 'empty:',
      'components/mixins/form' : 'empty:',
      'components/mixins/loader' : 'empty:',
      'components/mixins/tabs' : 'empty:',
      'components/generic/paginator' : 'empty:',
      'components/generic/offset_paginator' : 'empty:',
      'components/generic/sidebar' : 'empty:',
      'components/generic/filter' : 'empty:',
      'components/generic/modal' : 'empty:',
      'components/generic/helper' : 'empty:',
      'components/generic/icon' : 'empty:',
      'components/generic/toolbar' : 'empty:',
      'components/generic/query_info' : 'empty:',
      'components/generic/orderby_box' : 'empty:',
      'subject' : 'empty:',
      'components/generic/toggle_switch' : 'empty:',
      'flash_messages' : 'empty:'
  }
});
