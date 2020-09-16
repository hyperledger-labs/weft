# Weftility

Simple command line utility to help work with the identity and connection files from Hyperledger Fabric and IBM Blockchain Platform (IBP)

**weft** /wɛft/ _noun_

(in weaving) the crosswise threads on a loom that are passed over and under the warp threads to make cloth.

## Installation

Minimum of node 12 needed.

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

## Microfab
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
            "name": "ourchannel",
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

In a suitable shell, copy and execute the `export...` commands.


