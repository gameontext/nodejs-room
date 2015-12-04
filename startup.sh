#!/bin/bash

if [ "$LOGSTASH_ENDPOINT" != "" ]; then
  cd /opt/room
  echo "Starting the node server"
  node server.js &
  echo Starting the logstash forwarder...
  sed -i s/PLACEHOLDER_LOGHOST/$LOGSTASH_ENDPOINT/g /opt/forwarder.conf
  cd /opt
  chmod +x ./forwarder
  echo -e $LOGSTASH_CERT > logstash-forwarder.crt
  echo -e $LOGSTASH_KEY > logstash-forwarder.key
  sleep 0.5
  ./forwarder --config ./forwarder.conf
else
  cd /opt/room
  echo "Starting the node server"
  node server.js
fi
