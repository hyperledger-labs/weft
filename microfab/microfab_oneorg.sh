#!/usr/bin/env bash
set -ev
cd "$(dirname "$0")/../_cfg"
export MICROFAB_CONFIG='{
    "endorsing_organizations":[
        {
            "name": "Ampretia"
        }
    ],
    "channels":[
        {
            "name": "channela",
            "endorsing_organizations":[
                "Ampretia"
            ]
        }
    ],
    "capability_level":"V1_4_2",
    "port":7575
}'
docker run --name microfab --rm -d -p 7575:7575 -e MICROFAB_CONFIG="${MICROFAB_CONFIG}" ibmcom/ibp-microfab
sleep 10
curl -s http://console.127-0-0-1.nip.io:7575/ak/api/v1/components | weft microfab -w ./_wallets -p ./_gateways -m ./_msp -f