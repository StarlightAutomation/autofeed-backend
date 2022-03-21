FROM scratch

ARG SERVER_IMAGE
ARG CLIENT_IMAGE

USER root
ADD root.tar /

ENV DATA_DIR=/etc/autofeed/data
ENV APP_DIR=/etc/autofeed/app
ENV CLIENT_DIR=/etc/autofeed/client
ENV SCRIPTS_DIR=/etc/autofeed/py-scripts
ENV API_URL=http://localhost:8080

# Install OS dependencies
RUN apt-get update -y && apt-get install -y dockerd

# Directory Structure
RUN mkdir -p /etc/autofeed
RUN mkdir /etc/autofeed/data

WORKDIR /tmp/autofeed
ADD . /tmp/autofeed

# Pull server image
RUN docker pull $SERVER_IMAGE && \
    docker tag $SERVER_IMAGE autofeed-server

# Pull client image
RUN docker pull $CLIENT_IMAGE && \
    docker tag $CLIENT_IMAGE autofeed-client

# Move Data
COPY ./data/base_configuration.json /etc/autofeed/data
COPY ./build/os/init.sh /etc/autofeed/init.sh
COPY ./build/os/update.sh /etc/autofeed/update.sh

RUN chmod +x /etc/autofeed/init.sh
RUN chmod +x /etc/autofeed/update.sh

WORKDIR /etc/autofeed
RUN rm -rf /tmp/autofeed
