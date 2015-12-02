#!/bin/bash

#
# This script is only intended to run in the IBM DevOps Services Pipeline Environment.
#

#echo Informing slack...
#curl -X 'POST' --silent --data-binary '{"text":"A new build for the Node.js room has started."}' $WEBHOOK > /dev/null
mkdir dockercfg ; cd dockercfg
echo Downloading Docker requirements..
wget --user=admin --password=$ADMIN_PASSWORD https://$BUILD_DOCKER_HOST:8443/dockerneeds.tar -q
echo Setting up Docker...
sudo apt-get update ; sudo apt-get install -y lxc
tar xzf dockerneeds.tar ; mv docker ../ ; cd .. ; chmod +x docker ; \
	export DOCKER_HOST="tcp://$BUILD_DOCKER_HOST:2376" DOCKER_TLS_VERIFY=1 DOCKER_CONFIG=./dockercfg

echo Building the docker image...
sed -i s/PLACEHOLDER_ADMIN_PASSWORD/$ADMIN_PASSWORD/g ./Dockerfile
./docker build -t gameon-room-nodejs .
echo Stopping the existing container...
./docker stop -t 0 gameon-room-nodejs || true
./docker rm gameon-room-nodejs || true
echo Starting the new container...
./docker run -d -p 5000:3000 -e LOGGING_DOCKER_HOST=$LOGGING_DOCKER_HOST -e CONCIERGE_KEY=$CONCIERGE_KEY --name=gameon-room-nodejs gameon-room-nodejs
