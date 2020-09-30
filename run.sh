#!/usr/bin/env bash
set -ex
echo "Hello"
ls -lart code

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 

[[ -s "/home/fabdev/.sdkman/bin/sdkman-init.sh" ]] && source "/home/fabdev/.sdkman/bin/sdkman-init.sh"

cd code

node -v
java -version

