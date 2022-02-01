import { render }  from 'react-dom';
import React from "react"
import CodeEditor from "components/generic/code_editor"
import sp from "sprintf"
import Utils from "utils"
import {makeUrl, A} from "routing"

var sprintf = window.sprintf; //for some reason require.js shim does not seem to work for sprintf
var createReactClass = require('create-react-class');

var IssueWidget = createReactClass({
    displayName: "IssueWidget",

    toggleContent: function(event) {
        event.preventDefault()
        this.setState({open: !this.state.open})
    },

    getInitialState : function(){
        return {open : false}
    },

    acceptCodeMirrorWidgetInstance: function(codeMirrorWidget) {
        this.codeMirrorWidget = codeMirrorWidget
    },

    componentDidUpdate: function() {
        this.codeMirrorWidget.changed()
    },

    render: function(){
        var state = this.state,
            props = this.props

        var titleText = props.issue.title !== undefined ? props.issue.title : 'An issue occurred here'
        var descriptionText = props.issue.description !== undefined ? props.issue.description : '(no description available)'
        var sprintfDict = {issue : props.issue, occurrence : props.issue.occurrences[props.occurrence]}

        try {
            descriptionText = sp.sprintf(descriptionText, sprintfDict)
        } catch(e) {
            console.error("sprintf for issue description failed", descriptionText, sprintfDict)
            console.log(e)
        }

        try {
            titleText = sp.sprintf(titleText, sprintfDict)
        } catch(e) {
            console.error("sprintf for issue title failed", titleText, sprintfDict)
            console.log(e)
        }


        var documentationLink
        if (props.issue.analyzer == 'code_patterns') {
          documentationLink = <p><A href={makeUrl("/issue_class/"+props.issue.code)} className="documentation-link">Learn more...</A></p>
        }

        var extraClasses = []
        if (props.emphasize)
            extraClasses.push('CodeMirror-emphasize')
        extraClasses.push("severity-"+props.issue.severity)
        if (state.open) extraClasses.push("open")

        return <div className={"CodeMirror-issueWidget clearfix "+extraClasses.join(" ")}>
            <A className="clearfix opener"
                onClick={this.toggleContent}>
                <i className="fa fa-chevron-right" />
                <h4 className="issue-title">{titleText}</h4>
            </A>
            <div className="issue-content">
              <p>{descriptionText}</p>
              {documentationLink}
            </div>
        </div>
    },
})

var IssueCodeEditor= createReactClass({
    displayName: "CodeEditorWithIssues",

    getInitialState : function(){
        return {
            issueIndex: this.indexIssues(this.props.issues)
        }
    },

    componentWillReceiveProps : function(props){
        if (!this.isMounted()) return
        this.setState({
            issueIndex: this.indexIssues(props.issues)
        })
        this.refs.editor.updateEditor(props)
    },

    indexIssues: function(issues) {
        var issueIndex = {}
        if(!issues) issues = []
        for(var i=0; i < issues.length; i++) {
            var issue=issues[i]
            for (var j in issue.occurrences){
                if(!issue.occurrences[j].from_row)
                    continue
                var line = issue.occurrences[j].from_row
                if (issueIndex[line] !== undefined)
                    issueIndex[line].push([issue,j])
                else
                    issueIndex[line] = [[issue,j]]
            }
        }
        return issueIndex
    },

    generateIssueWidget : function(issue, occurrenceIndex){
        if(!issue.occurrences[occurrenceIndex].from_row) return

        var props = this.props,
            state = this.state,
            emphasize = false

        var analyzer_code = issue.analyzer+":"+issue.code,
            line = issue.occurrences[occurrenceIndex].from_row,
            column = issue.occurrences[occurrenceIndex].from_column

        var key = issue.pk+"-"+occurrenceIndex
        var widget = <IssueWidget
            key={key}
            issue={issue}
            occurrence={parseInt(occurrenceIndex)}
            project={props.project}
            snapshot={props.snapshot}
            emphasize={emphasize} />
        var widgetDiv = document.createElement("div")
        //var widgetInstance = React.render(widget, widgetDiv)
         /*
        return {
            id: issue.pk + ":" + occurrenceIndex,
            widget: widgetDiv,
            line: line,
            emphasize: emphasize,
            acceptCodeMirrorWidgetInstance: widgetInstance.acceptCodeMirrorWidgetInstance
        }
        */
    },

    getLineWidgets: function(lines){
        var issueIndex = this.state.issueIndex
        var widgets = []
        for (var i=0;i < lines.length; i++){
            var line = lines[i]
            if (issueIndex[line] !== undefined) {
                issueIndex[line].map(function(item){
                    widgets.push(this.generateIssueWidget(item[0], item[1]))
                }.bind(this))
            }
        }
        return widgets
    },

    render: function(){
        var props = this.props

        return <div>
            <CodeEditor ref="editor"
                getLineWidgets={this.getLineWidgets}
                {...this.props}
              />
        </div>
    }
})

export default IssueCodeEditor
