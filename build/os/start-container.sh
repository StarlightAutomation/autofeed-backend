#! /bin/bash

CONTAINER=$1

if [[ $CONTAINER == "server" ]]; then
  docker run \
        --name autofeed-server \
        --hostname autofeed-server \
        --restart always \
        --privileged \
        -p 8080:8080 \
        --mount type=bind,src=/etc/autofeed/data,dst=/etc/autofeed/data \
        -d autofeed-server node .
elif [[ $CONTAINER == "client" ]]; then
  docker run \
        --name autofeed-client \
        --hostname autofeed-client \
        --link autofeed-server \
        --restart always \
        -p 3000:3000 \
        -d autofeed-client yarn start
fi
