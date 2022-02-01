import { render }  from 'react-dom';
import Utils from "utils"
import $ from "jquery"

var module = {}

module.enrichGroupedIssues = function(groupedIssues, issuesData) {
    var enrichedGroupedIssues = {}
    for (var group in groupedIssues) {
        enrichedGroupedIssues[group] = enrichIssues(groupedIssues[group], issuesData)
        if (enrichedGroupedIssues[group].length == 0)
            delete enrichedGroupedIssues[group]
    }
    return enrichedGroupedIssues
}

module.enrichIssues = function(issues, issuesData) {
    var enrichedIssues = []
    for (var i = 0; i < issues.length; i++) {
        var issue = $.extend({}, issues[i])
        issue["analyzer_code"] = issue["analyzer"] + ":" + issue["code"]
        if (issue.language == undefined && issue.file_revision !== undefined)
            issue.language = issue.file_revision.language
        else if (issue.language == undefined && issue.file_revision_language !== undefined)
            issue.language = issue.file_revision_language
        if (issuesData[issue.language] !== undefined) {
            var languageIssues = issuesData[issue.language]
            if (languageIssues.analyzers[issue.analyzer] !== undefined) {
                var analyzerIssues = languageIssues.analyzers[issue.analyzer]
                if (analyzerIssues.codes[issue.code] !== undefined) {
                    var issueData = analyzerIssues.codes[issue.code]
                    for (var key in issueData) {
                        //we only set values that are undefined
                        if (issue[key] === undefined)
                            issue[key] = issueData[key]
                    }
                    enrichedIssues.push(issue)
                } else if (analyzerIssues['unknown_code'] !== undefined) {
                    var issueData = analyzerIssues['unknown_code']
                    for (var key in issueData) {
                        //we only set values that are undefined
                        if (issue[key] === undefined)
                           issue[key] = issueData[key]
                    }
                }
            }
        }
    }
    return enrichedIssues
}

module.titleForAttributeName = function(attribute) {
    switch (attribute) {
        case "severity":
            return "Severity"
        case "categories":
            return "Category"
        case "language":
            return "Language"
        case "analyzer_code":
            return "Analyzer-Code"
        default:
            return attribute
    }
}

module.titleForAttributeValue = function(attribute, value) {
    if (attribute === 'severity') {
        switch (value) {
            case 1:
                return 'critical'
            case 2:
                return 'potential bug'
            case 3:
                return 'minor issue'
            case 4:
                return 'recommendation'
            default:
                return value
        }
    } else if (attribute === 'analyzer_code') {
        var regex = /^([\w\d\-\_]+)\:([\w\d\-\-]+)$/ig
        var result = regex.exec(value)
        var analyzer = result[1]
        var code = result[2]
        return value
    }
    return value
}

module.classForAttribute = function(attribute, value) {
    return attribute + "-" + value
}

module.valuesFor = function(issues, attribute) {
    var values = []
    for (var i = 0; i < issues.length; i++) {
        var issue = issues[i]
        var value = issue[attribute]
        if (!Array.isArray(value)) {
            value = [value]
        }
        for (var j = 0; j < value.length; j++) {
            var subvalue = value[j]
            if (!Utils.contains(values, subvalue) && subvalue !== undefined)
                values.push(subvalue)
        }
    }
    return values
}

module.extractFilters = function(params, filterAttributes, issues) {
    var parsers = {
        severity: function(value) {
            return (Array.isArray(value) ? value.map(function(x) {
                return parseInt(x)
            }) : parseInt(value))
        }
    }

    var filters = {}
    for (var i = 0; i < filterAttributes.length; i++) {
        var attribute = filterAttributes[i]
        if (params[attribute] !== undefined) {
            filters[attribute] = attribute in parsers ? parsers[attribute](params[attribute]) : params[attribute]
        }
    }

    return filters
}

module.filterIssues = function(issues, filters) {
    var filteredIssues = $.extend([], issues)
    for (var attribute in filters) {
        var value = filters[attribute]
        filteredIssues = module.issuesFor(filteredIssues, attribute, value)
    }
    return filteredIssues
}

module.checkMatch = function(valueA, valueB) {
    var valuesA
    var valuesB
    if (Array.isArray(valueA))
        valuesA = valueA
    else
        valuesA = [valueA]
    if (Array.isArray(valueB))
        valuesB = valueB
    else
        valuesB = [valueB]

    for (var i = 0; i < valuesA.length; i++)
        for (var j = 0; j < valuesB.length; j++) {
            if (valuesA[i] == valuesB[j]) //we use == instead of === here to allow matches of the form "1" == 1
                return true
        }
    return false
}

module.issuesFor = function(issues, attribute, value) {
    var filteredIssues = []
    for (var i = 0; i < issues.length; i++) {
        var issue = issues[i]
        if (module.checkMatch(issue[attribute], value) === true)
            filteredIssues.push(issue)
    }
    return filteredIssues
}

module.countFor = function(issues) {
    var count = [0, 0]
    for (var i = 0; i < issues.length; i++) {
        var issue = issues[i]
        if (issue.count !== undefined) {
            count[0] += issue.count[0]
            count[1] += issue.count[1]
        } else {
            count[0] += 1
            count[1] += 1
        }
    }
    return count
}

module.generateIssuesFromSnapshotSummary = function(summary, path, issuesData) {
    var issues = []

    if (summary === undefined || summary[path] === undefined)
        return issues
    for (var language in summary[path]) {
        if (!language)
            continue
        var language_issues = summary[path][language]
        for (var analyzer in language_issues) {
            if (!analyzer)
                continue
            var analyzer_issues = language_issues[analyzer]
            for (var code in analyzer_issues) {
                if (!code)
                    continue
                var issue = {
                    code: code,
                    analyzer: analyzer,
                    language: language,
                    count: analyzer_issues[code]
                }
                issues.push(issue)
            }
        }
    }

    return module.enrichIssues(issues, issuesData)
}

module.groupIssuesByAnalyzerCode = function(issues) {
    var groupedIssues = {}
    for (var i in issues) {
        var issue = issues[i]
        var analyzerCode = issue["analyzer"] + ":" + issue["code"]
        if (!(analyzerCode in groupedIssues))
            groupedIssues[analyzerCode] = []
        groupedIssues[analyzerCode].push(issue)
    }
    var groupedIssuesList = []
    for (var key in groupedIssues) {
        var issues = groupedIssues[key]
        groupedIssuesList.push({
            key: key,
            issues: issues
        })
    }
    return groupedIssuesList.sort(function(a, b) {
        return a.issues[0].severity - b.issues[0].severity
    })
}


module.parseIssueGroupParams = function(params) {
    if (!params)
        return []
    var groups = params.groups

    if (groups === undefined)
        return {
            names: [],
            params: {}
        }
    else if (!Array.isArray(groups))
        groups = [groups]
    var d = {
        names: [],
        params: {}
    }
    for (var i in groups) {
        var group = groups[i]
        var components = group.split(":")
        if (components.length < 2)
            continue
        var name = components[0] + ":" + components[1]
        d.names.push(name)
        d.params[name] = {}
        for (var j = 2; j < components.length; j++) {
            var str = components[j]
            var prefix = str.substr(0, 1)
            var value = str.substr(1)
            switch (prefix) {
                case 'p':
                    d.params[name].page = parseInt(value)
                    break
                case 'f':
                    d.params[name].file = parseInt(value)
                    break
                case 'o':
                    d.params[name].occurrence = parseInt(value)
                    break
            }
        }
    }
    return d
}

module.issueGroupParamsToUrlParams = function(params) {
    var groups = []
    for (var name in params) {
        var p = params[name]
        var groupUrl = name
        if (p.page !== undefined)
            groupUrl += ':p' + p.page
        if (p.file !== undefined)
            groupUrl += ':f' + p.file
        if (p.occurrence !== undefined)
            groupUrl += ':o' + p.occurrence
        groups.push(groupUrl)
    }
    return groups
}

module.updateIssueGroupParams = function(params, group, values) {
    var newParams = $.extend({}, params)
    newParams[group] = $.extend({}, newParams[group])
    for (var key in values) {
        if (values[key] === undefined)
            delete newParams[group][key]
        else
            newParams[group][key] = values[key]
    }
    return newParams
}

export default module
