BUILD_FINAL_DIR=build
SOURCE_DIR=src
STATIC_FILES=
MAIN_FRONTEND_PATH=../../../frontend
ES6_SRC_FILES = $(shell find $(SOURCE_DIR) -name "*.es6")
ES6_FILES = $(subst $(SOURCE_DIR),$(BUILD_TMP_DIR)/static,$(ES6_SRC_FILES))
JS_FILES = $(subst .es6,.js,$(ES6_FILES))

export PATH := 	./node_modules/.bin:$(MAIN_FRONTEND_PATH)/node_modules/.bin:$(PATH)
export NODE_PATH := $(MAIN_FRONTEND_PATH)/node_modules:$(NODE_PATH)


BUILD_TMP_DIR=newBuild
BUILD_ENVIRONMENT=production


all: $(BUILD_ENVIRONMENT)

clean:
	rm -rf $(BUILD_FINAL_DIR)
	rm -rf $(BUILD_TMP_DIR)

production: assets extra scripts bower babel static-files scss optimize-css


development: assets extra scripts babel static-files scss watch

optimize: copy-assets copy-extra optimize-rjs

copy-assets:
	mkdir -p $(BUILD_TMP_DIR)/optimized/static
	mkdir -p $(BUILD_TMP_DIR)/static/assets
	mkdir -p $(BUILD_TMP_DIR)/newBuild/static/assets
	#cp -rf $(BUILD_TMP_DIR)/static/assets $(BUILD_TMP_DIR)/optimized/static

copy-extra:
	cp -rf $(BUILD_TMP_DIR)/static/extra/* $(BUILD_TMP_DIR)/static/js

optimize-rjs:
	#r.js -o $(BUILD_TMP_DIR)/static/js/build.js optimize=none
	r.js -o $(BUILD_TMP_DIR)/static/js/build.js
	#we copy require.js (so that we can include it)
	cp $(BUILD_TMP_DIR)/static/bower_components/requirejs/require.js \
	   $(BUILD_TMP_DIR)/optimized/static/js/require.min.js

scripts:
	mkdir -p $(BUILD_TMP_DIR)/static/js;
	rsync -am $(SOURCE_DIR)/js --include="*.js" $(BUILD_TMP_DIR)/static

bower:
	mkdir -p $(BUILD_TMP_DIR)/static
	bower install --config.directory=$(BUILD_TMP_DIR)/static/bower_components

#compiles all ES6 files to JS (this is faster than compiling each file individually)
babel:
	babel $(SOURCE_DIR)/js -x ".es6" --out-dir $(BUILD_TMP_DIR)/static/js --source-maps inline

assets: $(BUILD_DIR)
	mkdir -p $(BUILD_TMP_DIR)
	rsync -am $(SOURCE_DIR)/assets $(BUILD_TMP_DIR)/static

extra: $(BUILD_DIR)
	mkdir -p $(BUILD_TMP_DIR)
	rsync -am $(SOURCE_DIR)/extra $(BUILD_TMP_DIR)/static


#used in watch, as it is faster
es6-files: $(JS_FILES)

#compiles ES6 into JS files using babel (for es6-files rule)
%.js : %.es6
	babel $< --out-file $@ --source-maps inline

scss: $(SOURCE_DIR)/scss/main.scss
	mkdir -p $(BUILD_TMP_DIR)/static/css
	scss $(SOURCE_DIR)/scss/main.scss $(BUILD_TMP_DIR)/static/css/main.css

optimize-css: $(BUILD_TMP_DIR)/static/css/main.css
	mkdir -p $(BUILD_TMP_DIR)/optimized/static/css
	#we generate the output in the same directory, as relative imports won't work otherwise...
	cleancss -o $(BUILD_TMP_DIR)/static/css/main.min.css \
			    $(BUILD_TMP_DIR)/static/css/main.css
	


static-files: $(STATIC_FILES)

$(STATIC_FILES):
	cp -p $(SOURCE_DIR)/$@ $(BUILD_TMP_DIR)/static/$@

watch:
	@which inotifywait || (echo "Please install inotifywait";exit 2)
	@while true ; do \
		inotifywait -r src -e create,delete,modify || break; \
		$(MAKE) assets scripts es6-files static-files scss || break;\
	done

