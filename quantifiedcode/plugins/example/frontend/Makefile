#!/bin/bash

ifeq ($(ENVIRONMENT),development)
	BUILD_TMP_DIR=build
	BUILD_ENVIRONMENT=development
else
	BUILD_TMP_DIR=newBuild
	BUILD_ENVIRONMENT=production
endif

$(info Build dir: $(BUILD_TMP_DIR))

BUILD_FINAL_DIR=build
BUILD_BACKUP_DIR=lastBuild
SOURCE_DIR=src
STATIC_FILES=
MAIN_FRONTEND_PATH=../../../frontend
ES6_SRC_FILES = $(shell find $(SOURCE_DIR) -name "*.es6")
ES6_FILES = $(subst $(SOURCE_DIR),$(BUILD_TMP_DIR)/static,$(ES6_SRC_FILES))
JS_FILES = $(subst .es6,.js,$(ES6_FILES))

export PATH := 	./node_modules/.bin:$(MAIN_FRONTEND_PATH)/node_modules/.bin:$(PATH)
export NODE_PATH := $(MAIN_FRONTEND_PATH)/node_modules:$(NODE_PATH)

all: $(BUILD_ENVIRONMENT)

clean:
	rm -rf $(BUILD_FINAL_DIR)
	rm -rf $(BUILD_TMP_DIR)
	rm -rf $(BUILD_BACKUP_DIR)

production: backup assets scripts babel static-files scss optimize move

development: assets scripts babel static-files scss watch

optimize: optimize-css optimize-rjs pre-compress #compress-img

optimize-css:
	cleancss -r $(BUILD_TMP_DIR) -o $(BUILD_TMP_DIR)/static/css/main.min.css $(BUILD_TMP_DIR)/static/css/main.css

optimize-rjs:
	r.js -o $(BUILD_TMP_DIR)/static/js/build.js

#compress-img:
#	find $(BUILD_TMP_DIR)/optimized/static/ -type f -name "[^.]*.png" -exec optipng -q -o 3 -- {} +

pre-compress:
	find $(BUILD_TMP_DIR)/optimized/static/ -type f -name "[^.]*.css" -exec gzip -k -f --best {} +
	find $(BUILD_TMP_DIR)/optimized/static/ -type f -name "[^.]*.js" -exec gzip -k -f --best {} +
	find $(BUILD_TMP_DIR)/optimized/static/ -type f -name "[^.]*.svg" -exec gzip -k -f --best {} +

scripts:
	mkdir -p $(BUILD_TMP_DIR)/static/js;
	rsync -rupE $(SOURCE_DIR)/js --include="*.js" $(BUILD_TMP_DIR)/static;

babel:
	babel $(SOURCE_DIR)/js -x ".es6" --out-dir $(BUILD_TMP_DIR)/static/js;

$(BUILD_TMP_DIR):
	mkdir -p $(BUILD_TMP_DIR)

assets: $(BUILD_TMP_DIR)
	rsync -rupE $(SOURCE_DIR)/assets $(BUILD_TMP_DIR)/static

#used in watch, as it is faster
es6-files: $(JS_FILES)

#compiles ES6 into JS files using babel
%.js : %.es6
	babel $< --out-file $@

scss: $(SOURCE_DIR)/scss/main.scss
	mkdir -p $(BUILD_TMP_DIR)/static/css
	scss $(SOURCE_DIR)/scss/main.scss $(BUILD_TMP_DIR)/static/css/main.css

static-files: $(STATIC_FILES)

$(STATIC_FILES):
	cp -p $(SOURCE_DIR)/$@ $(BUILD_TMP_DIR)/static/$@

#COMPILED_JSX_SOURCES=$(shell find $(SOURCE_DIR)/js -name '*.jsx' | xargs -n1 bash -c 'echo $(BUILD_TMP_DIR)/static$${0\#$(SOURCE_DIR)}')
#$(COMPILED_JSX_SOURCES):
#	@$(eval JSX_FILENAME=$(shell echo $@ | xargs -n1 -exec /bin/bash -c 'echo $(SOURCE_DIR)$${0#newBuild/static}' ))
#	jsx $(JSX_FILENAME) $@

.PHONY: scripts

backup:
	@if [ ! -e $(BUILD_TMP_DIR) ]; then \
		mkdir $(BUILD_TMP_DIR); \
	fi;

watch:
	@which inotifywait || (echo "Please install inotifywait";exit 2)
	@while true ; do \
		inotifywait -r src -e create,delete,move,modify || break; \
		$(MAKE) assets scripts es6-files static-files scss || break;\
	done

move:
	@if [ -e $(BUILD_BACKUP_DIR) ]; then \
		rm -rf $(BUILD_BACKUP_DIR); \
	fi;

	if [ -e $(BUILD_FINAL_DIR) -a ! $(BUILD_TMP_DIR) = $(BUILD_FINAL_DIR) ]; then \
		mv $(BUILD_FINAL_DIR) $(BUILD_BACKUP_DIR); \
	fi;

	if [ ! $(BUILD_TMP_DIR) = $(BUILD_FINAL_DIR) ]; then \
		mv $(BUILD_TMP_DIR) $(BUILD_FINAL_DIR); \
	fi;

rollback:
	@if [ -e $(BUILD_BACKUP_DIR) ]; then \
		rm -rf $(BUILD_FINAL_DIR); \
		mv $(BUILD_BACKUP_DIR) $(BUILD_FINAL_DIR); \
	fi;
