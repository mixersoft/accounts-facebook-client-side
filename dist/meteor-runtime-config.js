/**
*

  // To install Meteor server, use mupx
  // see: https://github.com/arunoda/meteor-up/tree/mupx

*
*/


setMeteorRuntime = function(){
  var runConfig, hostname, port, connect, settings;

  // copy from Meteor settings.json
  settings = {
    "public": {
      "label": "staging",
      "facebook": {
        "permissions": [
          "public_profile",
          "email",
          "user_friends"
        ]
      }
    }
  };

  switch (window.location.hostname) {
    case 'localhost':
      runConfig = "DEV";
      hostname = window.location.hostname;
      port = '3333';
      connect = ['http://', hostname, ':', port, '/'].join('');
      break;
    case 'example.com':
      runConfig = "BROWSER";
      hostname = window.location.hostname
      port = '3333';
      connect = ['http://', hostname, ':', port, '/'].join('');
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
      break;
  }


  window.__meteor_runtime_config__ = angular.extend( {}, window.__meteor_runtime_config__, {
    LABEL: runConfig,
    DDP_DEFAULT_CONNECTION_URL: connect,
    PUBLIC_SETTINGS: settings["public"]
  });

  return
}

setMeteorRuntime();

// meteorServer = ['http://', window.location.hostname, ':3333']
// __meteor_runtime_config__ = {};
// __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL = meteorServer.join('');
