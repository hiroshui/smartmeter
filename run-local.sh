#!/bin/bash
set -eu

echo -e "Deploy proxy in background"
node tasmota/tasmota-cors-proxy/src/proxy.js &

echo -e "Run localhost frontend"
cd frontend/

npm run dev