#!/bin/bash 
set -ev
DIR="$(dirname "$0")/../"
cd ${DIR}
export CORE_PEER_LOCALMSPID=AmpretiaMSP
export CORE_PEER_ADDRESS=ampretiapeer-api.127-0-0-1.nip.io:7575
export CORE_PEER_MSPCONFIGPATH=/home/matthew/github.com/ampretia/ibpaft/_cfg/_msp/Ampretia/ampretiaadmin/msp 
export FABRIC_CFG_PATH=/home/matthew/config

CCNAME=simple-v220-node
peer chaincode install --name ${CCNAME} --lang node --path ${DIR}/contracts/${CCNAME} --version 1 ${DIR}/${CCNAME}.cds
peer chaincode instantiate --name ${CCNAME} --version 1 -c '{"args":[]}' --channelID channela 

#export PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id')
#peer lifecycle chaincode approveformyorg -o orderer-api.127-0-0-1.nip.io:7575 --channelID minifignet --name simple --version 1 --sequence 1 --waitForEvent --package-id ${PACKAGE_ID}
#peer lifecycle chaincode commit -o orderer-api.127-0-0-1.nip.io:7575 --channelID minifignet --name simple --version 1 --sequence 1 