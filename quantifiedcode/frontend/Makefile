BUILD_FINAL_DIR=build
BUILD_BACKUP_DIR=lastBuild
SOURCE_DIR=src
STATIC_FILES=
MAIN_FRONTEND_PATH=../../../frontend
ES6_SRC_FILES = $(shell find $(SOURCE_DIR) -name "*.es6")
ES6_FILES = $(subst $(SOURCE_DIR),$(BUILD_FINAL_DIR)/static,$(ES6_SRC_FILES))
JS_FILES = $(subst .es6,.js,$(ES6_FILES))

export PATH := 	./node_modules/.bin:$(MAIN_FRONTEND_PATH)/node_modules/.bin:$(PATH)
export NODE_PATH := $(MAIN_FRONTEND_PATH)/node_modules:$(NODE_PATH)

ifeq ($(ENVIRONMENT),development)
	BUILD_ENVIRONMENT=development
else
	BUILD_ENVIRONMENT=production
endif

$(info Build dir: $(BUILD_FINAL_DIR))


all: $(BUILD_ENVIRONMENT)

clean:
	rm -rf $(BUILD_FINAL_DIR)
	rm -rf $(BUILD_BACKUP_DIR)

production: scripts bower babel static-files scss optimize-css optimize move

development: scripts babel static-files scss watch

optimize: optimize-rjs



optimize-rjs:
	#r.js -o $(BUILD_FINAL_DIR)/static/js/build.js
	#we copy require.js (so that we can include it)
	#cp $(BUILD_FINAL_DIR)/static/bower_components/requirejs/require.js \
	#   $(BUILD_FINAL_DIR)/optimized/static/js/require.min.js

scripts:
	mkdir -p $(BUILD_FINAL_DIR)/static/js;
	rsync  $(SOURCE_DIR)/js --include="*.js" $(BUILD_FINAL_DIR)/static

bower:
	mkdir -p $(BUILD_FINAL_DIR)/static
	bower install --config.directory=$(BUILD_FINAL_DIR)/static/bower_components

#compiles all ES6 files to JS (this is faster than compiling each file individually)
babel:
	babel $(SOURCE_DIR)/js -x ".es6" --out-dir $(BUILD_FINAL_DIR)/static/js --source-maps inline


#used in watch, as it is faster
es6-files: $(JS_FILES)

#compiles ES6 into JS files using babel (for es6-files rule)
%.js : %.es6
	babel $< --out-file $@ --source-maps inline

scss: $(SOURCE_DIR)/scss/main.scss
	mkdir -p $(BUILD_FINAL_DIR)/static/css
	scss $(SOURCE_DIR)/scss/main.scss $(BUILD_FINAL_DIR)/static/css/main.css

optimize-css: $(BUILD_FINAL_DIR)/static/css/main.css
	mkdir -p $(BUILD_FINAL_DIR)/optimized/static/css
	#we generate the output in the same directory, as relative imports won't work otherwise...
	cleancss -o $(BUILD_FINAL_DIR)/static/css/main.min.css \
			    $(BUILD_FINAL_DIR)/static/css/main.css
	#we move the file to another directory afterwards...
	mv $(BUILD_FINAL_DIR)/static/css/main.min.css \
	   $(BUILD_FINAL_DIR)/optimized/static/css/main.min.css

static-files: $(STATIC_FILES)

$(STATIC_FILES):
	cp -p $(SOURCE_DIR)/$@ $(BUILD_FINAL_DIR)/static/$@

watch:
	@which inotifywait || (echo "Please install inotifywait";exit 2)
	@while true ; do \
		inotifywait -r src -e create,delete,move,modify || break; \
		$(MAKE)  scripts es6-files static-files scss || break;\
	done

backup:
	@if [ ! -e $(BUILD_FINAL_DIR) ]; then \
		mkdir $(BUILD_FINAL_DIR); \
	fi;

move:
	@if [ -e $(BUILD_BACKUP_DIR) ]; then \
		rm -rf $(BUILD_BACKUP_DIR); \
	fi;

	if [ -e $(BUILD_FINAL_DIR) -a ! $(BUILD_FINAL_DIR) = $(BUILD_FINAL_DIR) ]; then \
		mv $(BUILD_FINAL_DIR) $(BUILD_BACKUP_DIR); \
	fi;

	if [ ! $(BUILD_FINAL_DIR) = $(BUILD_FINAL_DIR) ]; then \
		mv $(BUILD_FINAL_DIR) $(BUILD_FINAL_DIR); \
	fi;

