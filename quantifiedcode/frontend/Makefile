BUILD_FINAL_DIR=build
BUILD_BACKUP_DIR=lastBuild
SOURCE_DIR=src
MAIN_FRONTEND_PATH=../../../frontend

export PATH := 	./node_modules/.bin:$(MAIN_FRONTEND_PATH)/node_modules/.bin:$(PATH)
export NODE_PATH := $(MAIN_FRONTEND_PATH)/node_modules:$(NODE_PATH)

all: bower move

clean:
	rm -rf $(BUILD_FINAL_DIR)
	rm -rf $(BUILD_BACKUP_DIR)

bower:
	mkdir -p $(BUILD_FINAL_DIR)/static
	bower install --config.directory=$(BUILD_FINAL_DIR)/static/bower_components

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

.PHONY: all clean bower move

