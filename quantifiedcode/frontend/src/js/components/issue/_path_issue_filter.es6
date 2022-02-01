import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import {makeUrl, A} from "routing"
import PathSelector from "components/generic/path_selector"
import IssueHelpers from "helpers/issue"
import PropTypes from 'prop-types';
var createReactClass = require('create-react-class');


var PathIssueFilter = createReactClass({
  displayName: 'PathIssueFilter',

  propTypes: {
    //the currently selected path
    path: PropTypes.string.isRequired,
    //the currently selected filters
    filters: PropTypes.object.isRequired,
    //the issuesSummary object, with the first nesting level already
    //removed. This means one of the "all", "new", "deleted" objects
    //returned by the server and not the top level object.
    issuesSummary: PropTypes.any.isRequired,
    //the meta data describing the different issues (required for filtering
    //the issues)
    issuesData: PropTypes.any.isRequired,
    //the baseUrl used for building URLs
    baseUrl: PropTypes.string.isRequired,
    //the params used for building URLs
    params: PropTypes.object.isRequired,
  },

  getAvailableSubdirectories : function(path){
    var pathWithTrailingSlash = path + (path != "" ? "/" : "")
    var currentFilters = this.props.filters
    var issuesSummary = this.props.issuesSummary
    var issuesData = this.props.issuesData
    var subfoldersWithIssues = []
    Object.keys(issuesSummary).forEach(function(folderPath) {
      //only display subdirectories of the current path
      if(folderPath.substr(0, pathWithTrailingSlash.length) != pathWithTrailingSlash)
        return
      var name = folderPath.substr(pathWithTrailingSlash.length)
      //do only display directories which are directly contained within the current directory
      if(name.indexOf("/") != -1)
        return
      //do not display the own directory; the check is necccessary especially for the root directory
      if(name == "")
        return
      //do not display paths which do not contain issues (taking the current filters into account)
      var issues = IssueHelpers.generateIssuesFromSnapshotSummary(issuesSummary, folderPath, issuesData)
      var filteredIssues = IssueHelpers.filterIssues(issues, currentFilters)
      if(filteredIssues.length == 0)
        return
      subfoldersWithIssues.push(name)
    })
    return subfoldersWithIssues
  },

  render: function(){
      var path = this.props.path || ''

      var pathComponents = path.split("/")
      if (pathComponents.length == 1 && pathComponents[0] == '')
        pathComponents = []

      var partialPaths = pathComponents.reduce(function(paths,currentPath){
          paths.push([paths[paths.length-1][0] + (paths[paths.length-1][0] !== '' ? '/' : '' )+currentPath,currentPath])
          return paths
        },
        [['',<i title="filter issues by directory" className="octicon octicon-file-directory" />]]
      )

      var breadCrumbs = partialPaths.map(function(pathComponent){
        return {
          href: makeUrl(this.props.baseUrl,{path : pathComponent[0] != '' ? pathComponent[0] : undefined}, this.props.params),
          title: pathComponent[1]
        }
      }.bind(this))

      var subdirectories = this.getAvailableSubdirectories(path)
      var subdirectoriesDropdown = subdirectories.map(function(subfolder){
          var fullPath = path + (path !== '' ? '/' : '' )+subfolder
          return <li key={fullPath}><A href={makeUrl(this.props.baseUrl,{path : fullPath},this.props.params)}>{subfolder}</A></li>
      }.bind(this))

      return <PathSelector path={breadCrumbs} childrenDropdown={subdirectoriesDropdown}/>
  }
})

export default PathIssueFilter
