/**
*

  // To install Meteor server, use mupx
  // see: https://github.com/arunoda/meteor-up/tree/mupx

*
*/


var setMeteorRuntime = function(){
  var runConfig, hostname, port, connect, settings, oauth_rootUrl;

  switch (window.location.hostname) {
    case 'localhost':
      runConfig = "DEV";
      hostname = window.location.hostname;
      port = '3333';
      connect = ['http://', hostname, ':', port, '/'].join('');
      oauth_rootUrl = ['http://', hostname, ':', '3000', '/'].join('');
      break;
    case 'example.com':
      runConfig = "BROWSER";
      hostname = window.location.hostname
      port = '3333';
      connect = ['http://', hostname, ':', port, '/'].join('');
      // same as window.location.href.split('#').shift()
      oauth_rootUrl = window.location.href.split('#').shift();
      break;
    default:
      if (ionic.Platform.isWebView() == false) {
        console.error("ERROR: unknown runtime configuration");
        break;
      }
      runConfig = "DEVICE";
      hostname = 'example.com';
      port = '3333';
      connect = ['http://', hostname, ':', port, '/'].join('');
      // accounts-facebook-cordova does NOT use oauth redirect_uri
      oauth_rootUrl = '';
      break;
  }

  window.__meteor_runtime_config__ = angular.extend( {}, window.__meteor_runtime_config__, {
    LABEL: runConfig,
    DDP_DEFAULT_CONNECTION_URL: connect
  });

  /**
  *
  default/required Meteor.public.settings for accounts-facebook-cordova
  1. expose Meteor.settings.public on Meteor SERVER as follows:
     Meteor.methods({'settings.public': function(){
       return Meteor.settings.public;
     });

  2. extend on Meteor CLIENT-side by:
    Meteor.call('settings.public', function(err, result) {
    if (err) {
      return;
    }
    Meteor.settings["public"] = _.extend({}, Meteor.settings["public"], result);
    return;
  });

  OR add manually, see setMeteorSettingsPublic()
  *
  */

  /*
   * add values to Meteor.settings.public on client-side manually
   */
  function setMeteorSettingsPublic(runConfig, oauth_rootUrl) {
    var settings = {
      "public": {
        "label": runConfig,
        "facebook": {
          "oauth_rootUrl": oauth_rootUrl,
          "profileFields": [
            "name",
            "gender",
            "location"
          ]
        }
      }
    };
    window.__meteor_runtime_config__["PUBLIC_SETTINGS"] = settings["public"];
  }  

  setMeteorSettingsPublic(runConfig, oauth_rootUrl);

  return
}
setMeteorRuntime();



// meteorServer = ['http://', window.location.hostname, ':3333']
// __meteor_runtime_config__ = {};
// __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL = meteorServer.join('');
