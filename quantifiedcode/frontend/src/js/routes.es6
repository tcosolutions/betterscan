import { render }  from 'react-dom';
import UserProjects from "components/project/user_projects"
import PublicProjects from "components/project/public_projects"
import NewProject from "components/project/new"
import ProjectDetails from "components/project/details"
import LoginSignup from "components/user/login_signup"
import Logout from "components/user/logout"
import UserSettings from "components/user/settings"
import UserSubscription from "components/subscription/settings"
import Validate from "components/user/validate"
import PasswordReset from "components/user/password_reset"
import PasswordResetRequest from "components/user/password_reset_request"
import Utils from "utils"

export default {
        /**
         * Index
         */
        '' :
            function(){
                if (Utils.isLoggedIn())
                return {
                        component :  UserProjects,
                        data : {}
                    }
                else
                    return {
                        component :  LoginSignup,
                        data : {}
                    }
                },
        /**
         * User
         */
        '/settings':
            function(){return {
                data : {},
                component : UserSettings,
                title : "User Settings",
            }
        },
        '/subscription':
            function(){return {
                data : {},
                component : UserSubscription,
                title : "User Subscription",
            }
        },
        '/user/validate/:email_auth_code':
            function(email_auth_code){return {
                data : {email_auth_code : email_auth_code, action : 'validate'},
                component : Validate,
            };},
        '/user/password-reset-request':
            function(){return {
                data : {} ,
                component : PasswordResetRequest,
            };},
        '/user/password-reset':
            function(){return {
                data : {},
                component : PasswordReset,
            };},
        '/user/logout':
            function(){return {
                data : {},
                component : Logout,
            };},
        '/user/:action':
            function(action){
                return {
                    data: {action: action},
                    component : LoginSignup,
                };},
        '/projects':
            function(){return {
                component : UserProjects,
                data : {},
                title : "Your Projects",
            };},
        '/explore':
            function(){return {
                component : PublicProjects,
                data : {},
                title : "Public projects"
            };},
        '/project/new' :
            function(){return {
                component : NewProject,
                data : {}
            };},
        '/project/:projectId/admin' :
            function(projectId){return {
                component : ProjectAdmin,
                data : {projectId:projectId}
            };},
        /**
         * Project details
         */
        '/project/:projectId' :
            function(projectId){return {
                component : ProjectDetails,
                data : {projectId:projectId,tab : 'issues'}
            };},
        '/project/:projectId/task/:taskId' :
            function(projectId,taskId){return {
                component : ProjectDetails,
                data : {projectId:projectId,tab : 'tasks',taskId : taskId}
            };},
        '/project/:projectId/:tab/' :
            function(projectId, tab) {return {
                component : ProjectDetails,
                data : {projectId: projectId, tab : tab}
            };},
        '/project/:projectId/snapshot/:snapshotId' :
            function(projectId,snapshotId){return {
                component : ProjectDetails,
                data : {projectId:projectId,snapshotId : snapshotId,tab : 'issues'}
            };},
        '/project/:projectId/diff/:snapshotId/:snapshotId/issues' :
            function(projectId,snapshotAId,snapshotBId){return {
                component : ProjectDetails,
                data : {projectId:projectId,snapshotAId : snapshotAId,
                        snapshotBId : snapshotBId, tab : 'issues'}
            };},
        '/project/:projectId/snapshot/:snapshotId/visualizations' :
            function(projectId, snapshotId){return {
                component : ProjectDetails,
                data : {projectId: projectId,tab : 'visualizations',snapshotId: snapshotId}
            };},
        '/project/:projectId/snapshot/:snapshotId/file/:path' :
            function(projectId, snapshotId,path){return {
                component: ProjectDetails,
                data: {
                    tab: 'snapshotFile',
                    projectId: projectId,
                    snapshotId: snapshotId,
                    path: path
                }
            };},
}
