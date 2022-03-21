#! /bin/bash

APP=$1
IMAGE=$2

docker pull $IMAGE
if [[ $APP == "server" ]]; then
    docker tag $IMAGE autofeed-server
elif [[ $APP === "client" ]]; then
    docker tag $IMAGE autofeed-client
else
    echo "Invalid app '$APP'"
    exit 1
fi

echo "Successfully updated $APP to use image $IMAGE"
exit 0
