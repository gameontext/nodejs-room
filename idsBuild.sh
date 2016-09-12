#!/bin/bash

#
# This script is only intended to run in the IBM DevOps Services Pipeline Environment.
#

echo Informing slack...
curl -X 'POST' --silent --data-binary '{"text":"A new build for the Node.js room has started."}' $SLACK_WEBHOOK_PATH > /dev/null

echo Setting up Docker...
mkdir dockercfg ; cd dockercfg
echo -e $KEY > key.pem
echo -e $CA_CERT > ca.pem
echo -e $CERT > cert.pem
cd ..
wget http://security.ubuntu.com/ubuntu/pool/main/a/apparmor/libapparmor1_2.8.95~2430-0ubuntu5.3_amd64.deb -O libapparmor.deb
sudo dpkg -i libapparmor.deb
rm libapparmor.deb
wget https://get.docker.com/builds/Linux/x86_64/docker-1.9.1 --quiet -O docker
chmod +x docker


echo Building the docker image...
./docker build -t gameon-room-nodejs .
echo Stopping the existing container...
./docker stop -t 0 gameon-room-nodejs || true
./docker rm gameon-room-nodejs || true
echo Starting the new container...
./docker run -d -p 5000:3000 --link=etcd -e ETCDCTL_ENDPOINT=http://etcd:4001 --name=gameon-room-nodejs gameon-room-nodejs

rm -rf dockercfg
