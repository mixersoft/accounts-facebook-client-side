/**
*

  // To install Meteor server, use mupx
  // see: https://github.com/arunoda/meteor-up/tree/mupx

*
*/


setMeteorRuntime = function(){
  var label, hostname, port, connect, oauthProxy;
  switch (window.location.hostname) {
    case 'localhost':
      // for localhost development
      label = "DEV";
      hostname = window.location.hostname;
      port = '3333';
      break;
    case 'example.com':
      // for a hosted server, see mupx for info on server deployment
      // refer to mup.json:"env" for config
      label = "BROWSER";
      hostname = window.location.hostname
      port = '3333';
      break;
    case "":
      // for running on cordova/device. 
      // NOT YET WORKING
      label = "DEVICE";
      hostname = 'example.com';
      port = '3333';
      break;
  }

  // connect should point to the correct meteor server
  connect = ['http://', hostname, ':', port, '/'].join('');

  window.__meteor_runtime_config__ = angular.extend( {}, window.__meteor_runtime_config__, {
    LABEL: label,
    DDP_DEFAULT_CONNECTION_URL: connect
  });

  return
}

setMeteorRuntime();

// meteorServer = ['http://', window.location.hostname, ':3333']
// __meteor_runtime_config__ = {};
// __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL = meteorServer.join('');
