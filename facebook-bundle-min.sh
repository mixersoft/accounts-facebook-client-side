# Run this script from home folder

# configs variables
NAME=accounts-facebook-client-side # Set the bundle file name
PACKAGE=accounts-facebook
DIST_FOLDER=dist # The folder that the bundled files will be copy in to

# run time variables
PROJECT_ROOT=$(pwd)
PROJECT_PARENT=$PROJECT_ROOT/..
DIST_PATH=$PROJECT_ROOT/$DIST_FOLDER
BUNDLER_TEMP="tmp-$NAME-bundler"
BUNDLER_PATH=$DIST_PATH/$BUNDLER_TEMP


# Ensure that the dist folder exists
mkdir -p $DIST_PATH

# Create temp meteor project
rm -rf $BUNDLER_PATH
meteor create $BUNDLER_PATH
cd $BUNDLER_PATH


# Add packages
echo > .meteor/packages # Delete all default packages
PACKAGE_DIRS=$PARENT meteor add $PACKAGE


# Build the packages
PACKAGE_DIRS=$PROJECT_PARENT meteor build --debug .
tar -zxf $BUNDLER_TEMP.tar.gz

OUTPUT_PATH="$DIST_PATH/$NAME-bundler-output"
PACKAGES_PATH="$DIST_PATH/$BUNDLER_TEMP/bundle/programs/web.browser/packages"

# Create output folder and copy the dependencies files
rm -rf $OUTPUT_PATH
mkdir $OUTPUT_PATH

# Concat files
# cat "$PACKAGES_PATH/meteor.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/reactive-var.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/observe-sequence.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/htmljs.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/jquery.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/blaze.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/spacebars.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/random.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/templating.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/url.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/reload.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/oauth.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/accounts-oauth.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/facebook.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/accounts-facebook.js" >> $OUTPUT_PATH/$NAME.bundle.js
cat "$PACKAGES_PATH/global-imports.js" >> $OUTPUT_PATH/$NAME.bundle.js

# Minify
npm install uglify-js
./node_modules/.bin/uglifyjs $OUTPUT_PATH/$NAME.bundle.js -o $OUTPUT_PATH/$NAME.bundle.min.js

# Copy the bundled files to the dist folder
cp $OUTPUT_PATH/$NAME.bundle.* $DIST_PATH

# Cleanup
# rm -rf $BUNDLER_PATH $OUTPUT_PATH
