#!/bin/bash
set -eu

#This creates a webservice that will run to get all the energy usag
#Its a bit BS as i could also directly call the API of Tapo via python, but its just for getting a feeling with the API
#Will use this for the Dashboard in Frontend by deploying the API on a Raspi and then call some read-only features to provide infos via Dashboard

source .env

# ENV Vars needs to be setted..
tapo-rest --port $PORT devices.json &

sleep 3

TOKEN=$(curl -s -X POST  -H "Content-Type: application/json" -d  "{ \"password\": \"$AUTH_PASSWORD\" }" http://localhost:$PORT/login)

for device in $(cat devices.json | jq -r '.devices[] | @base64'); do
    name=$(echo "$device" | base64 -d | jq -r .name)
    type=$(echo "$device" | base64 -d | jq -r .device_type  | awk '{print tolower($0)}')

    echo -e "request data for $name (Type: $type)"

    #urlencode
    NAME_ENC=$(jq -rn --arg x "${name}" '$x|@uri')

    # http://localhost:8080/actions/p110/get-energy-usage?device=Kueche
    DATA=$(curl -s -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" "http://localhost:$PORT/actions/$type/get-energy-usage?device=${NAME_ENC}")

done

#cleanup service
PID=$(ps aux | grep tapo-rest | awk '{ print $2}' | head -n 1)
kill $PID

echo "end of programm"
