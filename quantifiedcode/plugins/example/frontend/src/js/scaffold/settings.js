define([
  "jquery",
  "./constants",
  "./components/_user_settings"

],function (
  $,
  Constants,
  UserSettings
) {

  'use strict';
  var settings = {};

  settings.setUp = function(globalSettings) {

   globalSettings.providers["user.settings"].push({
      title: UserSettings.getTitle(),
      name : Constants.settingsTabName,
      component : UserSettings
    });

  };
  return settings;
});
