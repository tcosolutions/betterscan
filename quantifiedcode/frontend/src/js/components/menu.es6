import { render }  from 'react-dom';
import React from "react"
import Utils from "utils"
import {makeUrl, A} from "routing"
import LoaderMixin from "components/mixins/loader"
import FlashMessagesService from "flash_messages"
import {FlashMessagesMenu} from "components/generic/flash_messages"
import Settings from "settings"
import $ from "jquery"
var createReactClass = require('create-react-class');

var Menu = createReactClass({
    displayName: 'Menu',

    mixins : [LoaderMixin],

    resources : function(props){
        var resources = []
        if (Utils.isLoggedIn())
            resources.push(
                {
                    name : 'user',
                    endpoint : this.apis.user.getUser,
                    params: [{}],
                    mapping: {user: 'user'},
                }
            )
        if (props.data.projectId)
            resources.push(
                {
                    name : 'project',
                    endpoint : this.apis.project.getDetails,
                    params : [props.data.projectId,{}],
                    nonCritical: true,
                })
        return resources
    },

    silentLoading : true,

    getInitialState: function () {
        //List of baseUrls that can mark a link as active
        var activePages = {
            explore: false,
            projects: false
        }
        return {user: {admin: false}, project: {roles: {admin: []}}, activePages: activePages}
    },

    componentWillMount : function(){
        this.flashMessagesService = FlashMessagesService.getInstance()
        //set active page with received baseurl
        var activeBaseUrl = this.props.baseUrl.substring(1)
        this.setActivePage(activeBaseUrl)
    },

    componentWillReceiveProps : function(newProps){
        //set active page with received baseurl
        var activeBaseUrl = newProps.baseUrl.substring(1)
        this.setActivePage(activeBaseUrl)
    },

    analyzeProject : function(e){
        e.preventDefault()
        this.apis.project.analyze(this.props.data.projectId)
        this.flashMessagesService.postMessage({
            type: "info",
            description: "The project has been scheduled for analysis."
        })
    },

    resetProject : function(e){
        e.preventDefault()
        this.flashMessagesService.postMessage({
            type : "info",
            description : "The project has been scheduled for a reset."
        })
        this.apis.project.reset(this.props.data.projectId)
    },

    setActivePage : function(activeElement) {
        var defaultLoggedInPage = "projects"
        //reset all available pages in this.state.activePages
        var activePages = {}
        for (var prop in this.state.activePages) {
          if (this.state.activePages.hasOwnProperty(prop)) {
            activePages[prop] = false
          }
        }

        //set page as active, if it's available in activePages (this.state.activePages)
        if(activeElement !== undefined && activeElement in activePages) {
            activePages[activeElement] = true
            this.setState({activePages: activePages})
        }
        //set the default logged in page as active if baseurl is empty
        else if (activeElement.length === 0) {
            activePages[defaultLoggedInPage] = true
            this.setState({activePages: activePages})
        }
        else {
            this.setState({activePages: activePages})
        }
    },

    isActivePage : function(baseUrl) {
        if (baseUrl in this.state.activePages)
            return this.state.activePages[baseUrl]
    },

    setActiveClass : function(baseUrl) {
        if (this.isActivePage(baseUrl))
            return "active"
        return ""
    },

    buildNewMenuList: function(isOffCanvas, user, project){
        var newMenuList = []



        if (isOffCanvas)
            newMenuList.push(<li key="new-menu-off-canvas-hide" className="off-canvas-hide" onClick={this.offCanvasToggle.bind(this, null)}><i className="fa fa-angle-double-right"></i></li>)
        newMenuList.push(<li key="new-project"><A id="new-project-link" href={makeUrl("/project/new")}><i className="octicon octicon-repo"/> New project</A></li>)
        if (isOffCanvas) {
            return <ul className="dropdown-menu" id="new-menu">
                    {newMenuList}
                </ul>
        }
         return <ul className="dropdown-menu">
                     {newMenuList}
                 </ul>
    },

    buildUserMenu: function(isOffCanvas, user){

        var dropdownToggle = <A className="dropdown-toggle"
                   data-toggle="dropdown">
                      <i className="fa fa-user"/> <b className="caret"></b>
                </A>

        var userMenuList = []
        if (isOffCanvas)
            userMenuList.push(<li key="user-menu-off-canvas-hide" className="off-canvas-hide"onClick={this.offCanvasToggle.bind(this, null)}><i className="fa fa-angle-double-right"></i></li>)
        userMenuList.push(<li key="user-name" className="section"><span><strong>{user.name}</strong></span></li>)
        userMenuList.push(<li key="divider1" role="separator" className="divider"></li>)
        userMenuList.push(<li key="settings"><A id="settings-link" href={makeUrl("/settings")}>Settings</A></li>)
        userMenuList.push(<li key="subscription"><A id="subscription-link" href={makeUrl("/subscription")}>Subscription</A></li>)
        userMenuList.push(<li key="divider3" role="separator" className="divider"></li>)
        userMenuList.push(<li key="logout"><A id="logout-link" href={makeUrl("/user/logout")}>Logout</A></li>)

        if(isOffCanvas)
            return <ul className="dropdown-menu" id="user-menu">
                    {userMenuList}
                </ul>

        return <li className="dropdown">
                {dropdownToggle}
                <ul className="dropdown-menu">
                    {userMenuList}
                </ul>
            </li>
    },

    buildMenuLinks: function(isOffCanvas) {
        var menuLinkList = []
        if (isOffCanvas)
            menuLinkList.push(<li key="menu-links-off-canvas-hide" className="off-canvas-hide" onClick={this.offCanvasToggle.bind(this, null)}><i className="fa fa-angle-double-right"></i></li>)
        menuLinkList.push(<li key="your-projects"><A className={this.setActiveClass("projects")}  id="projects-link" href={makeUrl("/projects")}>Your projects</A></li>)
        menuLinkList.push(<li key="explore"><A className={this.setActiveClass("explore")} id="explore-link" href={makeUrl("/explore")} title="Explore the code quality of thousands of open source projects.">Explore</A></li>)

        if (isOffCanvas)
            return <ul className="dropdown-menu" id="menu-links">
                {menuLinkList}
            </ul>

        return <ul className="nav navbar-nav">
                    {menuLinkList}
                </ul>

    },

    offCanvasToggle : function(menu){
        if(menu !== null) {
            $(".on-canvas").not(menu).removeClass("on-canvas")
            $(menu).toggleClass("on-canvas")
        }
        else
            $(".on-canvas").removeClass("on-canvas")
    },

    render: function () {
        var state = this.state,
            data = state.data,
            project = data.project,
            user = data.user,
            flashMessagesMenu = <FlashMessagesMenu
                baseUrl={this.props.baseUrl}
                params={this.props.params}/>


        var newMenu = <li className="new">
            <A href="#" className="dropdown-toggle" data-toggle="dropdown"><i className="fa fa-plus" /> <b className="caret"></b></A>
            {this.buildNewMenuList()}
        </li>

        var newMenuOffCanvas = this.buildNewMenuList(true)

        if (user) {

            var newMenuOffCanvas = this.buildNewMenuList(true, user, project)

            var userMenu = this.buildUserMenu(false, user)
            var userMenuOffCanvas = this.buildUserMenu(true, user)

            var menuLinks = this.buildMenuLinks(false)
            var menuLinksOffCanvas = this.buildMenuLinks(true)

            return <div>
                <div className="collapse navbar-collapse" id="toggle-menu">
                    <div id="menu-component">
                        {menuLinks}
                        <ul className="nav navbar-nav navbar-right">
                            {flashMessagesMenu}
                            {newMenu}
                            {userMenu}
                        </ul>
                    </div>
                </div>
                <ul className="off-canvas-buttons">
                    {flashMessagesMenu}
                    <li className="off-canvas-toggle" onClick={this.offCanvasToggle.bind(this, "#menu-links")}><i className="fa fa-bars"/></li>
                    <li className="off-canvas-toggle" onClick={this.offCanvasToggle.bind(this, "#new-menu")}><i className="fa fa-plus" /></li>
                    <li className="off-canvas-toggle" onClick={this.offCanvasToggle.bind(this, "#user-menu")}><i className="fa fa-user"/></li>
                </ul>
                <div id="off-canvas-menu">
                    <div className="menus" onClick={this.offCanvasToggle.bind(this, null)}>
                        {menuLinksOffCanvas}
                        {newMenuOffCanvas}
                        {userMenuOffCanvas}
                    </div>
                </div>
            </div>
        } else {
            return <div>
                <div className="collapse navbar-collapse" id="toggle-menu">
                    <div id="menu-component">
                        <ul className="nav navbar-nav navbar-right">
                            <li><A id="login-link" href={makeUrl("/user/login")}>Login</A></li>
                            <li><A id="signup-link" className="signup" href={makeUrl("/user/signup")}>Sign up</A></li>
                            <li><A id="explore-link" href={makeUrl("/explore")}>Explore</A></li>
                        </ul>
                    </div>
                </div>
                <ul className="off-canvas-buttons">
                    <li className="off-canvas-toggle" onClick={this.offCanvasToggle.bind(this, "#menu-links")}><i className="fa fa-bars"/></li>
                </ul>
                <div id="off-canvas-menu">
                    <div className="menus" onClick={this.offCanvasToggle.bind(this, null)}>
                        <ul className="dropdown-menu" id="menu-links">
                            <li><A id="login-link" href={makeUrl("/user/login")}>Login</A></li>
                            <li><A id="signup-link" className="signup" href={makeUrl("/user/signup")}>Sign up</A></li>
                            <li><A id="explore-link" href={makeUrl("/explore")}>Explore</A></li>
                        </ul>
                    </div>
                </div>
            </div>
        }
    }
})

export default Menu
