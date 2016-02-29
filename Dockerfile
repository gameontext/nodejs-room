FROM    node:4.3

MAINTAINER Ben Smith (benjsmi@us.ibm.com)

ADD https://download.elastic.co/logstash-forwarder/binaries/logstash-forwarder_linux_amd64 /opt/forwarder

RUN mkdir -p /opt/room
COPY ./src/ /opt/room/

RUN echo "Installing Node modules..." ; cd /opt/room ; npm install 

COPY ./forwarder.conf /opt/forwarder.conf
COPY ./startup.sh /opt/startup.sh

EXPOSE 3000

CMD ["/opt/startup.sh"]
