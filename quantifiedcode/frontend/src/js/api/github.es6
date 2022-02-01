import { render }  from 'react-dom';
import Utils from "utils"
import Constants from "github/constants"

var urlBase = Constants.urlBase

function githubURL(page) {
    return urlBase + "/" + page;
}

function githubProjectURL(projectId, page) {
    return githubURL("projects") + "/" + projectId + "/" + page;
}

export default {

    createProject(data,onSuccess,onError){
      return Utils.apiRequest({
        type : 'POST',
        url : githubURL("projects"),
        data : data,
        success : onSuccess,
        error: onError
      });
  },

    getUserRepositories(params,onSuccess,onError) {
      return Utils.apiRequest({
        type : 'GET',
        url : githubURL("repos?")+ Utils.toUrlParams(params),
        success : onSuccess,
        error: onError
      });
  },

    getWebhook(projectId,onSuccess,onError) {
      return Utils.apiRequest({
        type : 'GET',
        url : githubProjectURL(projectId, "webhook"),
        success : onSuccess,
        error: onError
      });
  },

    getSettings(projectId,onSuccess,onError) {
      return Utils.apiRequest({
        type : 'GET',
        url : githubProjectURL(projectId, "settings"),
        success : onSuccess,
        error: onError
      });
  },

    updateSettings(projectId,data,onSuccess,onError) {
      return Utils.apiRequest({
        type : 'PUT',
        data : data,
        url : githubProjectURL(projectId, "settings"),
        success : onSuccess,
        error: onError
      });
  },

    updateWebhook(projectId,onSuccess,onError) {
      return Utils.apiRequest({
        type : 'PUT',
        url : githubProjectURL(projectId, "webhook"),
        success : onSuccess,
        error: onError
      });
  },

    removeWebhook(projectId,onSuccess,onError) {
      return Utils.apiRequest({
        type : 'DELETE',
        url : githubProjectURL(projectId, "webhook"),
        success : onSuccess,
        error: onError
      });
  },

    reassignGithubOwner(projectId,onSuccess,onError) {
      return Utils.apiRequest({
        type : 'POST',
        url : githubProjectURL(projectId, "owner"),
        success : onSuccess,
        error: onError
      });
  },

    getProjectCollaborators(projectId,onSuccess,onError) {
      return Utils.apiRequest({
        type : 'GET',
        url : githubProjectURL(projectId, "collaborators"),
        success : onSuccess,
        error: onError
      });
  },

    getUserOrganizations(onSuccess,onError) {
      return Utils.apiRequest({
        type : 'GET',
        url : githubURL("organizations"),
        success : onSuccess,
        error: onError
      });
  },

    getOrganizationRepositories(organization,params,onSuccess,onError) {
      return Utils.apiRequest({
        type : 'GET',
        url : githubURL("organizations/" + organization + "/repos?") + Utils.toUrlParams(params),
        success : onSuccess,
        error: onError
      });
  },

    revokeAccess(onSuccess,onError) {
        return Utils.apiRequest({
            type : 'DELETE',
            url : "/authorize/github",
            success : onSuccess,
            error : onError
        });
    }

};
