export CODE_DIR=${PWD}
cd $CODE_DIR
docker run -e CODE_DIR -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && checkmate init'
docker run -e CODE_DIR -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && checkmate git init'
docker run -e CODE_DIR -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && checkmate git analyze'
docker run -e CODE_DIR -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && checkmate issues'
