import { render }  from 'react-dom';
import $ from "jquery"
import Prism from "prism"
Prism.languages.python={comment:{pattern:/(^|[^\\])#.*?(\r?\n|$)/g,lookbehind:!0},string:/("|')(\\?.)*?\1/g,keyword:/\b(as|assert|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|pass|print|raise|return|try|while|with|yield)\b/g,boolean:/\b(True|False)\b/g,number:/\b-?(0x)?\d*\.?[\da-f]+\b/g,operator:/[-+]{1,2}|=?&lt;|=?&gt;|!|={1,2}|(&){1,2}|(&amp;){1,2}|\|?\||\?|\*|\/|~|\^|%|\b(or|and|not)\b/g,ignore:/&(lt|gt|amp);/gi,punctuation:/[{}[\];(),.:]/g}

Prism.hooks.add('after-highlight', function (env) {
    // works only for <code> wrapped inside <pre data-line-numbers> (not inline)
    var pre = env.element.parentNode
    if (!pre || !/pre/i.test(pre.nodeName) || pre.className.indexOf('line-numbers') === -1) {
      return
    }

    var linesNum = (1 + env.code.split('\n').length)

    var firstLine = 1
    if (pre.hasAttribute('data-start')) {
      firstLine = parseInt(pre.getAttribute('data-start'), 10)
    }

    var highlight
    if (pre.hasAttribute('data-line')) {
      highlight = parseInt(pre.getAttribute('data-line'), 10)
    }

    var spans = []
    for(var line=1;line < linesNum;line++){
      if (highlight !== undefined && highlight == (line+firstLine))
        spans.push('<span class="line-highlight"><strong>'+(line+firstLine)+'</strong></span>')
      else
        spans.push('<span>'+(line+firstLine)+'</span>')
    }

    var lineNumbersWrapper = document.createElement('span')
    lineNumbersWrapper.className = 'line-numbers-rows'
    lineNumbersWrapper.innerHTML = spans.join("")

    env.element.appendChild(lineNumbersWrapper)

    })
