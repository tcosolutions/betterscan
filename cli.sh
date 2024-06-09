export CODE_DIR=${PWD}
cd $CODE_DIR
docker run -e CODE_DIR -e LIC -e OPENAI_GPT_API -v ${PWD}:${PWD} -ti tcosolutions/betterscan-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && git config --global --add safe.directory $CODE_DIR && checkmate init'
docker run -e CODE_DIR -e LIC -e OPENAI_GPT_API -v ${PWD}:${PWD}  -ti tcosolutions/betterscan-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && git config --global --add safe.directory $CODE_DIR && checkmate git init'
docker run -e CODE_DIR -e LIC -e OPENAI_GPT_API -v ${PWD}:${PWD} -ti tcosolutions/betterscan-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && git config --global --add safe.directory $CODE_DIR && checkmate git analyze --branch `git rev-parse --abbrev-ref HEAD`'
docker run -e CODE_DIR -e LIC -e OPENAI_GPT_API -v ${PWD}:${PWD}  -ti tcosolutions/betterscan-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && git config --global --add safe.directory $CODE_DIR && checkmate issues'
