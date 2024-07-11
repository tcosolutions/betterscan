# Directories
BUILD_FINAL_DIR = build
BUILD_BACKUP_DIR = lastBuild
SOURCE_DIR = src
BUILD_TMP_DIR ?= build
STATIC_FILES =

# Paths
MAIN_FRONTEND_PATH = ../../../frontend
ES6_SRC_FILES = $(shell find $(SOURCE_DIR) -name "*.es6")
ES6_FILES = $(patsubst $(SOURCE_DIR)/%, $(BUILD_TMP_DIR)/static/%, $(ES6_SRC_FILES))
JS_FILES = $(ES6_FILES:.es6=.js)

# Exported paths
export PATH := ./node_modules/.bin:$(MAIN_FRONTEND_PATH)/node_modules/.bin:$(PATH)
export NODE_PATH := $(MAIN_FRONTEND_PATH)/node_modules:$(NODE_PATH)

# Build environment
ifeq ($(ENVIRONMENT),development)
    BUILD_TMP_DIR = build
    BUILD_ENVIRONMENT = development
else
    BUILD_TMP_DIR = newBuild
    BUILD_ENVIRONMENT = production
endif

$(info Build dir: $(BUILD_TMP_DIR))

# Targets
all: $(BUILD_ENVIRONMENT)

clean:
	rm -rf $(BUILD_FINAL_DIR) $(BUILD_TMP_DIR) $(BUILD_BACKUP_DIR)

production: backup assets extra scripts bower babel static-files scss optimize-css optimize move

development: assets extra scripts babel static-files scss watch

optimize: copy-assets copy-extra optimize-rjs

copy-assets:
	mkdir -p $(BUILD_TMP_DIR)/optimized/static
	cp -rf $(BUILD_TMP_DIR)/static/assets $(BUILD_TMP_DIR)/optimized/static

copy-extra:
	cp -rf $(BUILD_TMP_DIR)/static/extra/* $(BUILD_TMP_DIR)/static/js

optimize-rjs:
	r.js -o $(BUILD_TMP_DIR)/static/js/build.js
	cp $(BUILD_TMP_DIR)/static/bower_components/requirejs/require.js $(BUILD_TMP_DIR)/optimized/static/js/require.min.js

scripts:
	mkdir -p $(BUILD_TMP_DIR)/static/js
	rsync -ruE $(SOURCE_DIR)/js --include="*.js" $(BUILD_TMP_DIR)/static

bower:
	mkdir -p $(BUILD_TMP_DIR)/static
	bower install --config.directory=$(BUILD_TMP_DIR)/static/bower_components

babel:
	babel $(SOURCE_DIR)/js -x ".es6" --out-dir $(BUILD_TMP_DIR)/static/js --source-maps inline

assets: $(BUILD_TMP_DIR)
	mkdir -p $(BUILD_TMP_DIR)
	rsync -am $(SOURCE_DIR)/assets $(BUILD_TMP_DIR)/static

extra: $(BUILD_TMP_DIR)
	mkdir -p $(BUILD_TMP_DIR)
	rsync -am $(SOURCE_DIR)/extra $(BUILD_TMP_DIR)/static

es6-files: $(JS_FILES)

%.js: %.es6
	babel $< --out-file $@ --source-maps inline

scss: $(SOURCE_DIR)/scss/main.scss
	mkdir -p $(BUILD_TMP_DIR)/static/css
	scss $(SOURCE_DIR)/scss/main.scss $(BUILD_TMP_DIR)/static/css/main.css

optimize-css: $(BUILD_TMP_DIR)/static/css/main.css
	mkdir -p $(BUILD_TMP_DIR)/optimized/static/css
	cleancss -o $(BUILD_TMP_DIR)/static/css/main.min.css $(BUILD_TMP_DIR)/static/css/main.css
	mv $(BUILD_TMP_DIR)/static/css/main.min.css $(BUILD_TMP_DIR)/optimized/static/css/main.min.css

static-files: $(STATIC_FILES)

$(STATIC_FILES):
	cp -p $(SOURCE_DIR)/$@ $(BUILD_TMP_DIR)/static/$@

watch:
	@which inotifywait || (echo "Please install inotifywait"; exit 2)
	@while true; do \
		inotifywait -r src -e create,delete,move,modify || break; \
		$(MAKE) assets scripts es6-files static-files scss || break; \
	done

backup:
	mkdir -p $(BUILD_TMP_DIR)

move:
	@if [ -e $(BUILD_BACKUP_DIR) ]; then \
		rm -rf $(BUILD_BACKUP_DIR); \
	fi

	@if [ -e $(BUILD_FINAL_DIR) -a ! "$(BUILD_TMP_DIR)" = "$(BUILD_FINAL_DIR)" ]; then \
		mv $(BUILD_FINAL_DIR) $(BUILD_BACKUP_DIR); \
	fi

	@if [ ! "$(BUILD_TMP_DIR)" = "$(BUILD_FINAL_DIR)" ]; then \
		mv $(BUILD_TMP_DIR) $(BUILD_FINAL_DIR); \
	fi

rollback:
	@if [ -e $(BUILD_BACKUP_DIR) ]; then \
		rm -rf $(BUILD_FINAL_DIR); \
		mv $(BUILD_BACKUP_DIR) $(BUILD_FINAL_DIR); \
	fi
