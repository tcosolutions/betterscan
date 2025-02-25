# Ensure CODE_DIR is defined as the current directory
export CODE_DIR=$(pwd)
cd "$CODE_DIR"

# Set environment variables and Docker options
ENV_VARS="-e CODE_DIR=$CODE_DIR -e OPENAI_GPT_API"
VOLUME_MOUNT="-v ${CODE_DIR}:${CODE_DIR}"
DOCKER_IMAGE="tcosolutions/betterscan-worker-cli:latest"
SAFE_DIR_CMD="git config --global --add safe.directory $CODE_DIR"
GIT_BRANCH_CMD="git rev-parse --abbrev-ref HEAD"

# Define a function to run Docker commands
run_docker() {
  docker run $ENV_VARS $VOLUME_MOUNT -ti $DOCKER_IMAGE /bin/sh -c "cd $CODE_DIR && $SAFE_DIR_CMD && $1"
}

# Initialize checkmate and analyze the git repository
run_docker "checkmate init --backend sqlite --backend-opts \"sqlite:////${CODE_DIR}/.checkmate/database.db\""
run_docker "checkmate git init --backend sqlite --backend-opts \"sqlite:////${CODE_DIR}/.checkmate/database.db\""
run_docker "checkmate git analyze --branch \`$GIT_BRANCH_CMD\`"
run_docker "checkmate issues"
