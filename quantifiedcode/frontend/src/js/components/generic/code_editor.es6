import PropTypes from 'prop-types';
import React from "react"
import ReactDOM from 'react-dom';

import CodeMirror from "codemirror/lib/codemirror"
import CMPythonMode from "codemirror/mode/python/python"
import YamlMode from "codemirror/mode/yaml/yaml"
var createReactClass = require('create-react-class');

var CodeEditor = createReactClass({

    /*
    A code editor component, with support for line and gutter widgets.

    IMPORTANT:

    When defining the getLineWidgets function, make sure that you return ONLY widgets
    that fall into the specified range of lines.  Returning widgets not belonging to
    these lines can cause rendering glitches, such as widgets being displayed multiple
    times and not correctly removed.
    */

    displayName: 'CodeEditor',

    propTypes: {
        code: PropTypes.string,
        divId: PropTypes.string,
        readOnly: PropTypes.bool,
        mode: PropTypes.string, //Python, YAML, ...
        firstLineNumber: PropTypes.number,
        height: PropTypes.number,
    },

    getDefaultProps : function(){
        return {
            divId: "code",
            readOnly : true,
            mode: "python",
            firstLineNumber: 1
        }
    },

    defaultLineWidgetOptions : {above : true,noHScroll : true, coverGutter: true},

    componentDidMount : function(){
        this.currentRun = 0
        this.lineWidgetsById = {}
        this.initializeEditor()
        this.updateEditor(this.props)
        window.addEventListener("resize", this.resizeHandler)
        this.resizeHandler(); //call it once in order to init sizes
    },

    componentWillUnmount : function() {
        window.removeEventListener("resize", this.resizeHandler)
    },

    componentWillReceiveProps : function(newProps){
        this.updateEditor(newProps)
    },

    updateEditor : function(props){
        if (props.code !== undefined && this.editor.getDoc().getValue() != props.code){
            this.editor.getDoc().setValue(props.code)
        }

        this.currentRun++
        this.linesRendered = {}
        var incrementallyRenderWidgets = function(run,start){
            if (run !== this.currentRun){
                return
            }
            if (start > this.editor.lineCount()){
                return
            }
            //this.renderWidgets(start,start+10)
            setTimeout(function(){incrementallyRenderWidgets(run,start+10)},1)
        }.bind(this)

        incrementallyRenderWidgets(this.currentRun,1)
    },

    renderWidgets : function(from,to){
        var props = this.props
        if (this.lineWidgetsById === undefined)
            return
        var unrenderedLines = []
        for(var i = from; i < to; i++){
            if (this.linesRendered[i] === undefined)
                unrenderedLines.push(i)
            this.linesRendered[i]=true
        }
        if (unrenderedLines.length === 0){
            return
        }
        //operation() encapsulates a bunch of updates and is crucial for good
        //performance when updating a CodeMirror instance
        this.editor.operation(function() {
            var widgetIds = {}
            if (props.getLineWidgets !== undefined){
                var lineWidgets = props.getLineWidgets(unrenderedLines)
                for(var i=0;i < lineWidgets.length;i++){
                    var lineWidget = lineWidgets[i]
                    var widget
                    widget = this.editor.addLineWidget(lineWidget.line-1,lineWidget.widget,lineWidget.options !== undefined ? lineWidget.options : this.defaultLineWidgetOptions)
                    if (widgetIds[lineWidget.line] === undefined)
                        widgetIds[lineWidget.line] = {}
                    if (widgetIds[lineWidget.line][lineWidget.id] !== undefined){
                        console.log("ID "+lineWidget.id+" redefined, skipping!")
                        continue
                    }
                    widgetIds[lineWidget.line][lineWidget.id] = widget
                    if(lineWidget.acceptCodeMirrorWidgetInstance) {
                      lineWidget.acceptCodeMirrorWidgetInstance(widget)
                    }
                }
            }

            for(var i = 0; i < unrenderedLines.length; i++){
                var line = unrenderedLines[i]
                var oldWidgets = this.lineWidgetsById[line]
                var newWidgets = widgetIds[line]

                if (oldWidgets !== undefined) {
                    for (var id in oldWidgets){
                        oldWidgets[id].clear()
                    }
                }
                this.lineWidgetsById[line] = newWidgets
            }
        }.bind(this))
    },

    initializeEditor: function(){
        var props = this.props
        this.editor = CodeMirror.fromTextArea(ReactDOM.findDOMNode(this.refs['textarea']), {
                        mode: props.mode,
                        lineNumbers: true,
                        firstLineNumber : props.firstLineNumber,
                        readOnly: props.readOnly,
                        theme : "qc",
                        gutters : ["CodeMirror-linenumbers"]
                    })

        this.editor.on("change", this.onChangeHandler)

        this.editor.on("viewportChange", function(instance, from, to) {
                this.unrenderedLines && this.renderWidgets( from != 0 ? from : 1, to)
            }.bind(this)
        )
    },

    onChangeHandler: function(cm) {
        var props = this.props
        if (props.onChange !== undefined) {
            props.onChange(cm)
        }
    },

    resizeHandler: function(e){
        if(!this.editor) return
        var wrapper = this.editor.getWrapperElement()
        if (this.props.height !== undefined){
            wrapper.style.height = this.props.height+"px"
        } else {
            var innerHeight = window.innerHeight
            var offsetParent = wrapper.offsetParent
            var wrapperHeight = innerHeight-80
            if (offsetParent != undefined && offsetParent != null)
                wrapperHeight = innerHeight - wrapper.offsetParent.offsetTop-80
              if (wrapperHeight < 400)
                wrapperHeight = 400
            wrapper.style.height = wrapperHeight+"px"
        }
        this.editor.refresh()
    },

    render : function(){
        return <div className="codeEditor" key="editor">
            {this.props.children}
            <textarea ref="textarea" key="textarea" id={this.props.divId}/>
        </div>
    }

})

export default CodeEditor
