# Weft

**weft** /wɛft/ _noun_
(in weaving) the crosswise threads on a loom that are passed over and under the warp threads to make cloth.

---

Simple command line utility and module, to help work Hyperledger Fabric, and other instations such as the IBM Blockchain Platform (IBP) and convert resources between them. This is intended to be a complement to the existing tools for each product. A lot of the code here is based on that in [hyperledger/fabric-samples](github.com/hyperledger/fabric-samples)

The end goals are to obtain, irrespective of how the Fabric infrastructure is created. 

- an *application wallets* and *idenities* for the Client SDKs to use
- the gateway *connection profiles* to let the Client SDKs to connect
- the MSP directory structure to permit the Fabric Peer CLIs to function
- packaged Chaincode/SmartContract

> NOTE: not formally supported software, this is a community resource. PRs welcome :-)

> Documentation under development... PRs very welcome :-)

## Installation

Minimum of node 16 needed; note that the *HyperledgerLab* are recommended to push to GitHub Packages; this does require a [little setup](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package)

Install as any node tool

```
npm install -g @hyperledger-labs/weft
```

## Commands available

```
weft [command]

Commands:
  weft wallet    Work with a SDK Application Wallet
  weft mspids    Work with the MSP Credentials Directory structure
  weft ca        Work with the Fabric CA for identities
  weft chaincode Work with a Chaincode Packages
  weft microfab  Process the ibp-microfab output; generates MSPCreds, Connection Profiles and Application wallets

Options:
  --help         Show help  [boolean]
  -v, --version  Show version number  [boolean]

```

## Working with Wallets

The 'classic' v1.4 and v2 Client SDKs use a 'Wallet', typically stored on disk. The new 'Gateway' SDKs also need identities, but they don't directly require or use filesystem wallet. Rather they required the individual identities/certificates. Though the on disk format used for wallets can be useful (they are JSON Files)

```
weft wallet -h

Work with a SDK Application Wallet

Commands:
  weft wallet import  Imports identities into an application wallet
  weft wallet export  Exports identities from an application wallet
  weft wallet ls      Lists Application Wallet identities

Options:
      --help          Show help  [boolean]
  -v, --version       Show version number  [boolean]
  -w, --walletpath    Path to application wallet  [required]
  -c, --compat        Set to use the 1.4 wallet format  [boolean] [default: false]
  -r, --createwallet  Create the wallet if not present  [boolean] [default: false]
  -f, --force         If the identity is already present, force overwrite it  [boolean] [default: false]
```

You can *import*, *export* or *list* identities in the application wallet. 

For *import* you can import an identity either in JSON file format, or the MSPCredentials disk format.

```
Imports identities into an application wallet

Commands:
  weft wallet import mspcreds  Import form MSP Credentials directory format
  weft wallet import ibp       Imports IBP identity and adds to application wallet

Options:
      --help          Show help  [boolean]
  -v, --version       Show version number  [boolean]
  -w, --walletpath    Path to application wallet  [required]
  -c, --compat        Set to use the 1.4 wallet format  [boolean] [default: false]
  -r, --createwallet  Create the wallet if not present  [boolean] [default: false]
  -f, --force         If the identity is already present, force overwrite it  [boolean] [default: false]
  -m, --mspid         MSPID to assign in this wallet  [required]
```

## Working with Chaincode

### Packaging chaincode

The top level command is 'chaincode package'. There are 3 subcommands depending on the 'format' of the package that you want to create. Either 'full' to include all the code for Peer Managed Chaincode Containers. 'ccaas' for the Chaincode-as-a-service builders, or 'k8s' for the K8S builder. 

```
weft chaincode package

Create a chaincode package (tgz) to install on peers

Commands:
  weft chaincode package full  Include all code to run under Peer managed chaincode containers
  weft chaincode package caas  Chaincode-as-a-service Builders for user managed chaincode containers
  weft chaincode package k8s   K8S Builder for Kubernetes managed chaincode containers

Chaincode Package:
  -p, --path     Path to the root directory of the chaincode or file
  -l, --label    Label of the chaincode to use  [required]
  -q, --quiet    Quiet mode, only output the packageid to stdout  [boolean] [default: "false"]
  -a, --archive  filename of the output tgz  [string]
```

- **label** Each chaincode package needs a label
- **quiet** this will only output the PackageID - useful for scripting purposes
- **archive** the filename of the output tgz file. If not specified it will be `<label>.tgz`
- **path** need to provide the code for the full format, and for the other builders will be the (optional) location of the `META-INF` directory (the directory it is in)

### Full Format

```
weft chaincode package full

Include all code to run under Peer managed chaincode containers

Chaincode Package:
  -p, --path     Path to the root directory of the chaincode or file
  -l, --label    Label of the chaincode to use  [required]
  -q, --quiet    Quiet mode, only output the packageid to stdout  [boolean] [default: "false"]
  -a, --archive  filename of the output tgz  [string]
  -n, --lang     Language contract is written in  [choices: "auto", "go", "java", "javascript", "typescript"] [default: "auto"]
```
- **lang** is an optional parameter that can be specified to force the choice of language, otherwise it will be auto-detected.



**Java**
- Auto-detected if the path supplied 
  - contains a `build.gradle/build.gradle.kts/pom.xml` files
  - one or more JAR files
  - is reference to a JAR file itself
- For a single JAR referenced directly, the package will contain the META-INF in the same directory as the JAR (if it exists)
- If the directory contains JARs, or the java build file all the contents will be included, subject to pre-filtering by the `.fabricignore` file

**JavaScript**
- Auto-dected if the path contains a `package.json`
- All the content will be included subject to the `.npmignore` file. The `.fabricignore` file be processed as well before the .`.npmignore`

**TypeScript**
- Auto-detected if the path contains a `package.json` and a 'tsconfig.json` file
- The `out` directory in the `tsconfig.json` is checked. All contents of this is included, along with `package.json` and `package-log.json` `npm-shrinkwrap.json` if present. The META-INF directory will also be included. All subject to pre-filtering by the `.fabricignore` file

**Go**
- Auto-detected if the path contains a `go.mod` file
- All the contents will be included, subject to pre-filtering by the `.fabricignore` file


## Working with Microfab
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

## Use with IBM Blockchain Platform Instance

It is recommended to use the [Ansible IBP Collection]() to update, and maintain an IBP instance in production. Ansible tasks are available that can create identies, and deploy chaincodes. It produces the gateway connection profile as JSON that can be used directly in the application. 

The identities are in the IBP json format. Import these into an application wallet as follows.

```
weft wallet import --wallet ./_wallets/ --mspid  org1_msp_id  --json ./newid_appid.json
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

There are two gateway connection profiles created, these can be used directly by an application
```
ls "./organizations/peerOrganizations/org1.exampl.com/connection-org1.yaml" 
ls "./organizations/peerOrganizations/org2.example.com/connection-org2.yaml" 
```

### To use the Peer Commands

Assuming that the testnetwork is defined something like this `export TEST_NETWORK_DIR='...../fabric-samples/test-network'` then these environment variables will configure the peer commands to work with the test-network directly.

For Org1:
```

export CORE_PEER_ADDRESS="localhost:7051"
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH="$TEST_NETWORK_DIR/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_TLS_ENABLED="true"
export CORE_PEER_TLS_ROOTCERT_FILE="$TEST_NETWORK_DIR/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export ORDERER_CA="$TEST_NETWORK_DIR/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
```

For Org2:
```
export CORE_PEER_ADDRESS="localhost:9051"
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_MSPCONFIGPATH="/$TEST_NETWORK_DIR/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"
export CORE_PEER_TLS_ENABLED="true"
export CORE_PEER_TLS_ROOTCERT_FILE="$TEST_NETWORK_DIR/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
export ORDERER_CA="/$TEST_NETWORK_DIR/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
```

### To get an application identity

To enroll the admin user for Org1, for example:
```
weft ca enroll --name FredBlogs --profile ./test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json --wallet ./_cfg/_wallets/org1 --enrollid admin --enrollpwd adminpw -r
```

You can then register and enroll as many ids as needed

```
weft ca register --profile ./test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json --wallet ./_cfg/_wallets/org1 --adminName admin --enrollid=FredBlogs
```

Fred can now be enrolled and then the identity used.

```
weft ca enroll --name FredBlogs --profile ./test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json --wallet ./_cfg/_wallets/org1 --enrollid FredBlogs --enrollpwd <output from the register cmd> -r
```

### Loading a connection profile
Simplifies loading either as a JSON or YAML file

```
import { Identities, Utility, Infrastructure } from '@hyperledgendary/weftility';

// filename can be of yaml or json file
const connectionProfile = Utility.getGatewayProfile(filename);
```