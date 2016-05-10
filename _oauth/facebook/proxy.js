(function() {
  'use strict';
  var OauthProxy, appRun;

  angular.module('oauth', ['ionic']);

  OauthProxy = function($http) {
    var config, self;
    config = {
      rootUrl: __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL,
      path: location.pathname.slice(location.pathname.indexOf('_oauth'))
    };
    self = {
      get: function(options) {
        var url;
        if (options == null) {
          options = {};
        }
        options = angular.copy(config, options);
        url = [options.rootUrl, options.path, location.search].join('');
        console.log('proxy=' + url);
        return $http.get(url);
      },
      doOauthRedirect: function(config) {
        var credentialSecret, credentialString, credentialToken, err, error;
        if (config.setCredentialToken) {
          credentialToken = config.credentialToken;
          credentialSecret = config.credentialSecret;
          if (config.isCordova) {
            credentialString = JSON.stringify({
              credentialToken: credentialToken,
              credentialSecret: credentialSecret
            });
            window.location.hash = credentialString;
          }
          if (window.opener && window.opener.Package && window.opener.Package.oauth) {
            window.opener.Package.oauth.OAuth._handleCredentialSecret(credentialToken, credentialSecret);
          } else {
            try {
              localStorage[config.storagePrefix + credentialToken] = credentialSecret;
            } catch (error) {
              err = error;
              angular.noop;
            }
          }
        }
        if (!config.isCordova) {
          document.getElementById("completedText").style.display = "block";
          document.getElementById("loginCompleted").onclick = function() {
            return window.close();
          };
          window.close();
        }
      }
    };
    return self;
  };

  OauthProxy.$inject = ['$http'];

  appRun = function(oauthProxy) {
    console.log('href=' + window.location.href);
    return oauthProxy.get().then(function(result) {
      var credentials;
      if (result.status !== 200) {
        return console.warn(['Status', result.status]);
      }
      credentials = result.data.match(/({.*})/).pop();
      return credentials;
    }, function(err) {
      return console.warn(err);
    }).then(function(credentials) {
      var config;
      document.getElementById("config").innerHTML = credentials;
      config = JSON.parse(credentials);
      console.log('config=' + credentials);
      return oauthProxy.doOauthRedirect(config);
    });
  };

  appRun.$inject = ['oauthProxy'];

  angular.module('oauth').factory('oauthProxy', OauthProxy).run(appRun);

}).call(this);
