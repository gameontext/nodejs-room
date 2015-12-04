#!/bin/bash

#
# This script is only intended to run in the IBM DevOps Services Pipeline Environment.
#

echo Informing slack...
curl -X 'POST' --silent --data-binary '{"text":"A new build for the Node.js room has started."}' $WEBHOOK > /dev/null
mkdir dockercfg ; cd dockercfg
echo Downloading Docker requirements..
wget --user=admin --password=$ADMIN_PASSWORD https://$BUILD_DOCKER_HOST:8443/dockerneeds.tar -q
echo Setting up Docker...
wget http://security.ubuntu.com/ubuntu/pool/main/a/apparmor/libapparmor1_2.8.95~2430-0ubuntu5.3_amd64.deb -O libapparmor.deb
sudo dpkg -i libapparmor.deb
tar xzf dockerneeds.tar ; mv docker ../ ; cd .. ; chmod +x docker ; \
	export DOCKER_HOST="tcp://$BUILD_DOCKER_HOST:2376" DOCKER_TLS_VERIFY=1 DOCKER_CONFIG=./dockercfg

echo Building the docker image...
./docker build -t gameon-room-nodejs .
echo Stopping the existing container...
./docker stop -t 0 gameon-room-nodejs || true
./docker rm gameon-room-nodejs || true
echo Starting the new container...
./docker run -d -p 5000:3000 -e -e LOGSTASH_ENDPOINT=$LOGSTASH_ENDPOINT -e LOGSTASH_CERT="$LOGSTASH_CERT" -e LOGSTASH_KEY="$LOGSTASH_KEY" -e CONCIERGE_KEY=$CONCIERGE_KEY --name=gameon-room-nodejs gameon-room-nodejs
