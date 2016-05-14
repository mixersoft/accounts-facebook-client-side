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

### Meteor Server
```
cd /path/to/meteor
meteor add accounts-base mrt:accounts-facebook-cordova service-configuration webapp
```


## Configuration

### Meteor Server

Add to `/path/to/meteor/settings.json`
```
{
  "facebook": {
    "appId": "[AppId]",
    "secret": "[AppSecret]",
    "oauth_redirect_uri": "[ionic app rootUrl]"
  }
}
```
> the `ionic app rootUrl` is the rootUrl that will be usedfor the oauth redirect_uri.
> this is the url of the Ionic app (client). e.g. http://localhost:3000/

Add the following to `/path/to/meteor/server/bootstrap.js`
```
    // accounts-facebook config
    ServiceConfiguration.configurations.remove({
      service: "facebook"
    });
    ServiceConfiguration.configurations.upsert({
      service: "facebook"
    }, {
      $set: {
        appId: Meteor.settings.facebook.appId,
        loginStyle: "popup",
        secret: Meteor.settings.facebook.secret
      }
    });

    // to fix CORS restriction from client proxy
    WebApp.rawConnectHandlers.use("/_oauth", function(req, res, next) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return next();
    });
```

Patch the Meteor server file: `/path/to/meteor/.meteor/local/build/programs/server/packages/facebook.js`
```
responseContent = HTTP.get(
  "https://graph.facebook.com/v2.2/oauth/access_token", {
    params: {
      client_id: config.appId,
      // at line 83
-     redirect_uri: OAuth._redirectUri('facebook', config),
+     redirect_uri: OAuth._redirectUri('facebook', config,null,{rootUrl:Meteor.settings.facebook.oauth_redirect_uri}),
      client_secret: OAuth.openSecret(config.secret),
      code: query.code
    }
  }).content;
```



### Ionic client:

Edit `/dist/meteor-runtime-config.js` to point to your meteor server. 
- Check port setting for localhost, e.g. `meteor run --port 3333 --settings ./settings.json &`
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


##### Facebook App Settings
- click `+ Add Platform` and add `IOS platform` to Facebook App Settings
  - bundle ID from xcode project: com.example.AppName
  - single Sign On: `YES`



## Build

To create a fresh version of `accounts-facebook-client-side.bundle.js`, run `./facebook-bundle-min.sh`

> Note: the generated version will NOT include manual source edits to support Facebook login 
> with `cordova-plugin-facebook4`. 

[meteor-accounts]: https://www.meteor.com/accounts
[meteor-client-side]: https://github.com/idanwe/meteor-client-side
[cordova-plugin-facebook4]: https://github.com/jeduan/cordova-plugin-facebook4.git
[mupx]: https://github.com/arunoda/meteor-up/tree/mupx