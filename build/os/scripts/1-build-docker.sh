#! /bin/bash

docker build -t diyautofeed:latest \
    --build-arg SERVER_IMAGE=${SERVER_IMAGE} \
    --build-arg CLIENT_IMAGE=${CLIENT_IMAGE} \
    -f build/os/Dockerfile .
