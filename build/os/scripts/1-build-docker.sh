#! /bin/bash

docker build -t diyautofeed:latest \
    --arg SERVER_IMAGE=${SERVER_IMAGE} \
    --arg CLIENT_IMAGE=${CLIENT_IMAGE} \
    -f build/os/Dockerfile .
