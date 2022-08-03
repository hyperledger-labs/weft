#!/bin/sh
set -e -u

tmp_dir=$(mktemp -d -t ci-XXXXXXXXXX)
pushd $tmp_dir 1>&2 2>/dev/null
git clone https://github.com/hyperledger-labs/weft.git $tmp_dir
npm install && npm run build 
npm pack
npm install -g $(ls hyperledger-labs-weft-*)
popd
rm -rf $tmp_dir
