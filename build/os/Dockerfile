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
RUN apt-get update -y && apt-get install -y docker.io

# Directory Structure
RUN mkdir -p /etc/autofeed
RUN mkdir /etc/autofeed/data

WORKDIR /tmp/autofeed
ADD . /tmp/autofeed

# Setup server image
RUN echo $SERVER_IMAGE > /server-image

# Setup client image
RUN echo $CLIENT_IMAGE > /client-image

# Move Data
COPY ./data/base_configuration.json /etc/autofeed/data
COPY ./build/os/init.sh /etc/autofeed/init.sh
COPY ./build/os/update.sh /etc/autofeed/update.sh
COPY ./build/os/boot.sh /etc/autofeed/boot.sh
COPY ./build/os/start-container.sh /etc/autofeed/start-container.sh
COPY ./build/os/boot.service /lib/systemd/system

RUN chmod +x /etc/autofeed/init.sh
RUN chmod +x /etc/autofeed/update.sh
RUN chmod +x /etc/autofeed/boot.sh
RUN chmod +x /etc/autofeed/start-container.sh
RUN chmod 644 /lib/systemd/system/boot.service

WORKDIR /etc/autofeed
RUN rm -rf /tmp/autofeed
