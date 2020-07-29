# Weftility

Simple command line utility to help work with the JSON identity files

**weft** /wɛft/ _noun_

(in weaving) the crosswise threads on a loom that are passed over and under the warp threads to make cloth.


## Command line

Need to build from source at present.

```
git clone git@github.com:hyperledgendary/weftility.git
npm install && npm run build && npm link
```


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

## microfab

From the JSON configuration you can create the application wallets, and the gateways, and also the MSP directory structure to support the Peer commands

With a started microfab with two organizations

```
curl -s http://console.127-0-0-1.nip.io:8080/ak/api/v1/components | weft microfab -w ./_cfg/_wallets -p ./_cfg/_gateways -m ./_cfg/_msp 
```
There are some extra files that have to be extracted from the docker image, the command above will output the docker commands to use, as well as the environment variables to use to define a cmd line environment per organization

This will give the following directory structure.. with the `_msp` directory for the peer commands, the `_wallets` for the application wallets, and the `_gateways` for the gateways.

```
_cfg
├── _gateways
│   ├── digibankgateway.json
│   └── magnetocorpgateway.json
├── _msp
│   ├── DigiBank
│   │   └── digibankadmin
│   │       └── msp
│   │           ├── cacerts
│   │           ├── keystore
│   │           │   └── cert_sk
│   │           └── signcerts
│   │               └── digibankadmin.pem
│   ├── MagnetoCorp
│   │   └── magnetocorpadmin
│   │       └── msp
│   │           ├── cacerts
│   │           ├── keystore
│   │           │   └── cert_sk
│   │           └── signcerts
│   │               └── magnetocorpadmin.pem
│   └── Orderer
│       └── ordereradmin
│           └── msp
│               ├── cacerts
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

```



