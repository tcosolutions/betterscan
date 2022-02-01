import { render }  from 'react-dom';
import $ from 'jquery'
import PrismSettings from 'prism_settings'

var settings = {
    html5history : (history !== undefined && history.pushState !== undefined) ? true : false,
}

export default settings
