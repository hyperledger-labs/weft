# Weftility

Simple command line utility and module, to help work with the identity and connection files from Hyperledger Fabric Peers, Fabric SDKs and IBM Blockchain Platform (IBP) and convert between them. This is intended to be a complement to the existing tools for each product. A lot of the code here is based on that in [hyperledger/fabric-samples](github.com/hyperledger/fabric-samples)

The end goals are to obtain, irrespective of how the Fabric infrastructure is created. 

- an *application wallet* for the Client SDKs to use to get identies
- the *gateway connection profile to let the Client SDKs to connect
- a MSP directory structure to permit the Fabric Peer CLIs to function
- a set of JSON 'node' files to let the VSCode Blockchain Extension to connect [WIP]

**weft** /wɛft/ _noun_

(in weaving) the crosswise threads on a loom that are passed over and under the warp threads to make cloth.


> NOTE: not formally supported software, this is a community resource. PRs welcome :-)

## Installation

Minimum of node 12 needed.

Install as any node module, install globally for use as a CLI tool.

```
npm install -g @hyperledgendary/weft
```

## Commands available

```
weft [command]

Commands:
  weft enroll    Enrolls CA identity and adds to wallet
  weft import    Imports IBP identity and adds to wallet
  weft ls        Lists Application Wallet identities
  weft microfab  Process the Microfab output

Options:
  --help         Show help  [boolean]
  -v, --version  Show version number  [boolean]

For usage see https://github.com/hyperledendary/weftility
```

## Demos

There are 3 interactive scenarios here, that start with setting up a Fabric Network and then getting the gateway connection profile and an application wallet, and also if required the configuration needed for the Fabric Peer commands.



### Demo with Microfab
As an example let's start a Microfab instance with 2 organizations

```
export MICROFAB_CONFIG='{
    "endorsing_organizations":[
        {
            "name": "DigiBank"
        },
        {
            "name": "MagnetoCorp"
        }
    ],
    "channels":[
        {
            "name": "papernet",
            "endorsing_organizations":[
                "DigiBank",
                "MagnetoCorp"
            ]
        }
    ],
    "capability_level":"V2_0"
}'

docker run --name microfab --rm -ti -p 8080:8080 -e MICROFAB_CONFIG="${MICROFAB_CONFIG}" ibmcom/ibp-microfab
```

In a new terminal window, we can retrieve the JSON configuration and pipe that direct to `weft`. Create a new directory for hold the wallets, profiles etc. and issue the curl commands.

```
mkdir _cfg

curl -s http://console.127-0-0-1.nip.io:8080/ak/api/v1/components | weft microfab -w ./_cfg/_wallets -p ./_cfg/_gateways -m ./_cfg/_msp 
```

This will give the following directory structure.. with the `_msp` directory for the peer commands, the `_wallets` for the application wallets, and the `_gateways` for the gateways.

```
tree _cfg
_cfg
├── _gateways
│   ├── digibankgateway.json
│   └── magnetocorpgateway.json
├── _msp
│   ├── DigiBank
│   │   └── digibankadmin
│   │       └── msp
│   │           ├── admincerts
│   │           │   └── digibankadmin.pem
│   │           ├── cacerts
│   │           │   └── ca.pem
│   │           ├── keystore
│   │           │   └── cert_sk
│   │           └── signcerts
│   │               └── digibankadmin.pem
│   ├── MagnetoCorp
│   │   └── magnetocorpadmin
│   │       └── msp
│   │           ├── admincerts
│   │           │   └── magnetocorpadmin.pem
│   │           ├── cacerts
│   │           │   └── ca.pem
│   │           ├── keystore
│   │           │   └── cert_sk
│   │           └── signcerts
│   │               └── magnetocorpadmin.pem
│   └── Orderer
│       └── ordereradmin
│           └── msp
│               ├── admincerts
│               │   └── ordereradmin.pem
│               ├── cacerts
│               │   └── ca.pem
│               ├── keystore
│               │   └── cert_sk
│               └── signcerts
│                   └── ordereradmin.pem
└── _wallets
    ├── DigiBank
    │   └── digibankadmin.id
    ├── MagnetoCorp
    │   └── magnetocorpadmin.id
    └── Orderer
        └── ordereradmin.id

27 directories, 17 files

```

The output of the command also outputs some shell commands that you can use to configure the environment for using the `peer` command.

```
Environment variables: 
For DigiBank use these:
 
export CORE_PEER_LOCALMSPID=DigiBankMSP
export CORE_PEER_ADDRESS=digibankpeer-api.127-0-0-1.nip.io:8080
export CORE_PEER_MSPCONFIGPATH=/home/matthew/github.com/hyperledgendary/weftility/_cfg/_msp/DigiBank/digibankadmin/msp 
For MagnetoCorp use these:
 
export CORE_PEER_LOCALMSPID=MagnetoCorpMSP
export CORE_PEER_ADDRESS=magnetocorppeer-api.127-0-0-1.nip.io:8080
export CORE_PEER_MSPCONFIGPATH=/home/matthew/github.com/hyperledgendary/weftility/_cfg/_msp/MagnetoCorp/magnetocorpadmin/msp 

```

In a suitable shell, copy and execute the `export...` commands. Note that this is not using TLS, therefore there is less configuration needed.

**This therefore gives you the ability to use both the SDKs, and the peer commands to interact with microfab.**

## Use with IBP Instance - Ansible

It is recommended to use Ansible to update, and manitain an IBP instance in production. Ansible tasks are available that can create identies, and deploy chaincodes. It produces the gateway connection profile as JSON that can be used directly in the application. 

The indentities are in the IBP json format. Import these into an application wallet as follows.

```
weft import --wallet ./_wallets/ --mspid  org1_msp_id  --json ./newid_appid.json
# add the -c option if the wallet should be written for use with 1.4 sdks.
```

The peer commands don't really don't need to used in this case, as ansible should be used in preference for installing chaincode and registering ids.

## With the fabric-samples test network

From a working directory (that doesn't have the fabric-samplesl repo already), eg `~/github.com/` run this

```
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.1 1.4.9
```
Create the test network, it only really makes sense to create this with a Certificate Authority and CouchDB

```
cd ~/github.com/fabric-samples/test-network
./network.sh up createChannel -ca -s couchdb
```
If you've run this before, or any other version of this test-network, there is a chance that you might have left over docker volumes. These can cause 'odd-looking' errors.  Run `./network.sh down` first to clean up anything that might left over.

### Gateway Connection Profile

There are two gateway connection profiles created
```
ls "./organizations/peerOrganizations/org1.exampl.com/connection-org1.yaml" 
ls "./organizations/peerOrganizations/org2.example.com/connection-org2.yaml" 
```

For Org1:
```
export CORE_PEER_ADDRESS="localhost:7051"
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH="/home/matthew/github.com/hyperledger/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_TLS_ENABLED="true"
export CORE_PEER_TLS_ROOTCERT_FILE="/home/matthew/github.com/hyperledger/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export ORDERER_CA="/home/matthew/github.com/hyperledger/fabric-samples/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
```

For Org2:
```
export CORE_PEER_ADDRESS="localhost:9051"
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_MSPCONFIGPATH="/home/matthew/github.com/hyperledger/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"
export CORE_PEER_TLS_ENABLED="true"
export CORE_PEER_TLS_ROOTCERT_FILE="/home/matthew/github.com/hyperledger/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
export FABRIC_CFG_PATH="/home/matthew/github.com/hyperledger/fabric-samples/commercial-paper/organization/magnetocorp/../../../config"
export ORDERER_CA="/home/matthew/github.com/hyperledger/fabric-samples/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

```

      peer lifecycle chaincode package cp.tar.gz --lang node --path ./contract --label cp_0
      peer lifecycle chaincode install cp.tar.gz

      export PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id')
      echo $PACKAGE_ID

      peer lifecycle chaincode approveformyorg  --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
                                                --channelID mychannel  \
                                                --name papercontract  \
                                                -v 0  \
                                                --package-id $PACKAGE_ID \
                                                --sequence 1  \
                                                --tls  \
                                                --cafile $ORDERER_CA

      peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name papercontract -v 0 --sequence 1




            peer lifecycle chaincode package cp.tar.gz --lang node --path ./contract --label cp_0
      peer lifecycle chaincode install cp.tar.gz

      export PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id')
      echo $PACKAGE_ID

      peer lifecycle chaincode approveformyorg  --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
                                                --channelID mychannel  \
                                                --name papercontract  \
                                                -v 0  \
                                                --package-id $PACKAGE_ID \
                                                --sequence 1  \
                                                --tls  \
                                                --cafile $ORDERER_CA

      peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name papercontract -v 0 --sequence 1

      peer lifecycle chaincode commit -o localhost:7050 \
                                --peerAddresses localhost:7051 --tlsRootCertFiles ${PEER0_ORG1_CA} \
                                --peerAddresses localhost:9051 --tlsRootCertFiles ${PEER0_ORG2_CA} \
                                --ordererTLSHostnameOverride orderer.example.com \
                                --channelID mychannel --name papercontract -v 0 \
                                --sequence 1 \
                                --tls --cafile $ORDERER_CA --waitForEvent

To enroll the admin user for Org1:
```
weft enroll --name FredBlogs --profile ./test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json --wallet ./_cfg/_wallets/org1 --enrollid admin --enrollpwd adminpw -r
```




## Use as a module

Install as any module, `npm install --save @hyperledgendary/weftility`
When run as a module, the console log statements are not output.

### Loading a connection profile
Simplifies loading either as a JSON or YAML file

```
import { Identities, Utility, Infrastructure } from '@hyperledgendary/weftility';

// filename can be of yaml or json file
const connectionProfile = Utility.getGatewayProfile(filename);
```