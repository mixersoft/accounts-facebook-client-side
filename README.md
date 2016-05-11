# accounts-facebook-client-side

Use Meteor's [accounts-facebook][meteor-accounts] package with [meteor-client-side][meteor-client-side].

## Installation


### Meteor server:
`meteor add accounts-base accounts-facebook service-configuration webapp`

Add the following to your `./server/bootstrap.js`
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


### ionic client:
`bower install accounts-base-client-side`

`bower install accounts-facebook-client-side` (not sure this works)

Install ionic client manally:
- copy `/dist/*.js` to your project

Edit `/dist/meteor-runtime-config.js` to point to your meteor server. 
- Check port setting for localhost, e.g. `meteor run --port 3333 --settings ./settings.json &`
- use mupx to deploy hosted Meteor server (see https://github.com/arunoda/meteor-up/tree/mupx) and see mup.json:"env"

Copy `_oauth/facebook` folder to your ionic `www` folder.
- this page is loaded by the facebook oauth redirect_uri, e.g. http://localhost:3000/_oauth/facebook
- the pages is actually a proxy for the same page on your meteor server (from the accounts-facebook package) to completes the FB login

Add JS files to your ionic project `index.html`:

```
<script src="bower_components/accounts-base-client-side/dist/accounts-base-client-side.bundle.js"></script>
<script src="bower_components/accounts-facebook-client-side/dist/meteor-runtime-config.js"></script>
<script src="bower_components/accounts-facebook-client-side/dist/accounts-facebook-client-side.bundle.js"></script>
```

## Build

To create a fresh version of `accounts-facebook-client-side.bundle.js` just run `./facebook-bundle-min.sh`

[meteor-accounts]: https://www.meteor.com/accounts
[meteor-client-side]: https://github.com/idanwe/meteor-client-side


# Steps to install accounts-facebook-cordova

## install phonegap-facebook-plugin

### ionic Project
git clone https://github.com/jeduan/cordova-plugin-facebook4.git
ionic plugin remove phonegap-facebook-plugin
ionic plugin add /path/to/cloned/project/cordova-plugin-facebook4 \
   --variable APP_ID="AppId" \
   --variable APP_NAME="AppName"
*Note:* APP_ID and APP_NAME are applied to xcode project in `[AppName]-info.plist`

## install accounts-facebook-cordova

### on Meteor Server (via mupx deploy)
- `meteor add mrt:accounts-facebook-cordova`
- `meteor remove accounts-facebook`
- add "public" key to ``./meteor/settings-staging.json`
  - see: https://gist.github.com/jamielob/881e0fe059c0ef0eb36d

### in xcode project
- add to config.xml
<allow-navigation href="https://www.facebook.com/v2.2/dialog/oauth" />
<allow-navigation href="https://m.facebook.com/v2.2/dialog/oauth" />

### Facebook App Settings
- add `IOS platform` to Facebook App Settings
  - bundle ID from xcode project: com.example.AppName
  - single Sign On: YES

