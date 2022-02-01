import { render }  from 'react-dom';
import settings from "settings"
import RequestNotifier from "request_notifier"
import $ from "jquery"
var ux = {

    affixElement: function(selector, footerSelector, offsetTop, contentSelector, contentMultiple) {

        var element = $(selector)
        if (element !== undefined)
        {

            if (contentSelector !== undefined)
            {
                var multiple = contentMultiple !== undefined ? contentMultiple : 1
                var contentElement = $(contentSelector)
                var contentHeight = contentElement.outerHeight(true)
                var elementHeight = element.outerHeight(true)

                if (contentHeight / elementHeight < contentMultiple)
                {
                    return false
                }
            }


            var elementOffset = element.offset()
            if (elementOffset !== undefined)
            {
                offsetTop = typeof offsetTop === 'undefined' ? elementOffset.top : offsetTop
                element.affix({
                  offset: {
                    top: offsetTop,
                    bottom: function () {
                         return (this.bottom = $(footerSelector).outerHeight(true))
                     }
                  }
                })
            }
        }
    },

}

export default ux
