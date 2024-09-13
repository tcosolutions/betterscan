export CODE_DIR=${PWD}
cd $CODE_DIR

# Set environment variables for Docker
ENV_VARS="-e CODE_DIR -e OPENAI_GPT_API"
VOLUME_MOUNT="-v ${PWD}:${PWD}"
DOCKER_IMAGE="sunsolution/betterscan-worker-cli:latest"
SAFE_DIR_CMD="git config --global --add safe.directory $CODE_DIR"
GIT_BRANCH_CMD="git rev-parse --abbrev-ref HEAD"

# Define a function to run Docker commands
run_docker() {
  docker run $ENV_VARS $VOLUME_MOUNT -ti $DOCKER_IMAGE /bin/sh -c "cd $CODE_DIR && $SAFE_DIR_CMD && $1"
}

# Initialize checkmate and analyze the git repository
run_docker "checkmate init --backend sqlite"
run_docker "checkmate git init"
run_docker "checkmate git analyze --branch \`$GIT_BRANCH_CMD\`"
run_docker "checkmate issues html"
