# accounts-facebook-client-side (with Cordova support)

Use Meteor's [accounts-facebook][meteor-accounts] package with [meteor-client-side][meteor-client-side].

This package was developed to support client-side access to `accounts-facebook` for an angular-meteor project deployed with the ionic CLI. In this configuration, the client-side is NOT being hosted by the the Meteor server.

This package includes Facebook login support for mobile apps using [cordova-plugin-facebook4][cordova-plugin-facebook4] (currently only tested on IOS.)

## Installation

### Bower:
```
cd /path/to/ionic/project
bower install accounts-facebook-cordova-client-side
```

### NPM:
```
cd /path/to/ionic/project
npm install accounts-facebook-client-side
```

### Meteor Server
```
cd /path/to/meteor
meteor add accounts-base mrt:accounts-facebook-cordova service-configuration webapp
```


## Configuration

### Meteor Server
> the `ionic app rootUrl` is the rootUrl that will be used for the oauth redirect_uri.
> this is the url of the Ionic app (client). e.g. http://localhost:3000/

1. Configure your Facebook OAuth redirect URI for your Facebook app, see: `Facebook App > Product Settings > Facebook Login > Valid OAuth redirect URIs`
1. determine your `OAUTH_ROOTURL`

```
// example
oauth_redirect_uri = "http://example.com/_oauth/facebook";
OAUTH_ROOTURL = oauth_redirect_uri.replace('_oauth/facebook','');
```


Add to `/path/to/meteor/settings.json`
```
{
  "public" : {
    "facebook" : {
      "oauth_rootUrl": "[OAUTH_ROOTURL]",
      "profileFields": [
        "name",
        "gender",
        "location"
      ]
    }
  },
  "facebook": {
    "appId": "[AppId]",
    "secret": "[AppSecret]"
  }
}
```


call the following function from `/path/to/meteor/server/bootstrap.js`
```
  function config_AccountsFacebookClientSide(){

    // only include the rootUrl, i.e. "http:/example.com/" without the "_oauth/facebook"
    var oauth_rootUrl;
    oauth_rootUrl = Meteor.settings.public.facebook.oauth_rootUrl || "[OAUTH_ROOTURL]";
    Meteor.settings.public.facebook["oauth_rootUrl"] = oauth_rootUrl;


    if (Meteor.isServer) {
      /* NOTE: server/packages/facebook.js calls:
       *   OAuth._redirectUri('facebook', config)
       *   -> Meteor.absoluteUrl('_oauth/' + serviceName, absoluteUrlOptions)
       * without setting absoluteUrlOptions
       * Instead of hacking the package, you can set ROOT_URL manually for the server:
       */

      __meteor_runtime_config__.ROOT_URL = oauth_rootUrl;
      Meteor.absoluteUrl.defaultOptions.rootUrl = oauth_rootUrl;
    }

    // make Meteor.settings.public available to client-side
    Meteor.methods({
      'settings.public': function() {
        if (Meteor.isClient) {
          return;
        }
        return Meteor.settings["public"];
      }
    });

    // config accounts-facebook
    ServiceConfiguration.configurations.remove({
      service: "facebook"
    });
    ServiceConfiguration.configurations.upsert({
      service: "facebook"
    }, {
      $set: {
        appId: Meteor.settings.facebook.appId,
        secret: Meteor.settings.facebook.secret,
        loginStyle: "popup"
      }
    });

    // config oauthProxy to allow CORS from client
    WebApp.rawConnectHandlers.use("/_oauth", function(req, res, next) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return next();
    });

  }
```



### Ionic client:

Edit `/dist/meteor-runtime-config.js` to point to your meteor server. 
- Check port setting for localhost, e.g. `meteor run --port 3333 --settings ./settings.json &`
- Set `oauth_rootUrl` to match the Facebook Login OAuth redirect_uri BEFORE '_oauth/facebook', usually the same as `window.location.href.split('#').shift()`
- use mupx to deploy a hosted Meteor server (see [Meteor Up X][mupx], and mup.json:"env" for port number)

Copy `_oauth/facebook` folder to your ionic `www` folder.
- this page is loaded by the facebook oauth redirect_uri, e.g. http://localhost:3000/_oauth/facebook

> This page is actually a "proxy" for the same page on your Meteor server (included with the `accounts-facebook` package)
> The Meteor server does the work to exchange the oauth secret for a valid FB accessToken, and passes the token
> back to the page loaded by the redirect_uri.

Add JS files to your Ionic project `index.html`:

```
<script src="bower_components/accounts-base-client-side/dist/accounts-base-client-side.bundle.js"></script>
<script src="bower_components/accounts-facebook-client-side/dist/meteor-runtime-config.js"></script>
<script src="bower_components/accounts-facebook-client-side/dist/accounts-facebook-client-side.bundle.js"></script>
```

### Facebook App

Click `+ Add Product` under Product Settings and add `Facebook Login`

Add the following redirect URIs
```
http://localhost:3000/_oauth/facebook  http://myapp.com/path/to/myapp/_oauth/facebook 
```

> Note: the hosted *ionic app rootUrl* (e.g. `http://myapp.com/path/to/myapp/`) should match 
> the value of `oauth_redirect_uri` which you previously added to `/path/to/meteor/settings.json` 



#### Cordova Plugin:
> Note: This step is only required for if you need Facebook login from a mobile device.
> (only tested on IOS)

##### Install `cordova-plugin-facebook4`
```
cd /path/to/ionic/project
git clone https://github.com/jeduan/cordova-plugin-facebook4.git /path/to/cordova-plugin-facebook4
ionic plugin remove phonegap-facebook-plugin
ionic plugin add /path/to/cordova-plugin-facebook4 \
   --variable APP_ID="AppId" \
   --variable APP_NAME="AppName"
```
> Note: get AppId and AppName from your Facebook App Settings
> APP_ID and APP_NAME are applied to xcode project in `[AppName]-info.plist`

##### Configure IOS redirects
Add tags to `/path/to/ionic/project/config.xml`
```
<allow-navigation href="https://www.facebook.com/v2.2/dialog/oauth" />
<allow-navigation href="https://m.facebook.com/v2.2/dialog/oauth" />
```

##### on Meteor Server 
> Note: cordova-plugin-facebook4 support has only been tested against a hosted Meteor server (not localhost) 
> See: [Meteor Up X][mupx] for more details

Add to `/path/to/meteor/settings.json` for `accounts-facebook-cordova4` plugin
```
{
  "public": {
    "facebook": {
      "profileFields": [
        "name",
        "first_name",
        "last_name",
        "gender",
        "location"
      ]
    }
  }
}
```



##### Facebook App Settings
- click `+ Add Platform` and add `IOS platform` to Facebook App Settings
  - bundle ID from xcode project: com.example.AppName
  - single Sign On: `YES`


## Build

To create a fresh version of `accounts-facebook-client-side.bundle.js`, run `./facebook-bundle-min.sh`

> Note: the generated version will NOT include manual source edits to support Facebook login 
> with `cordova-plugin-facebook4`. See the Diff between `accounts-facebook-client-side.bundle.js` 
> and `accounts-facebook-client-side.bundle.0.js` to manually patch

[meteor-accounts]: https://www.meteor.com/accounts
[meteor-client-side]: https://github.com/idanwe/meteor-client-side
[cordova-plugin-facebook4]: https://github.com/jeduan/cordova-plugin-facebook4.git
[mupx]: https://github.com/arunoda/meteor-up/tree/mupx
