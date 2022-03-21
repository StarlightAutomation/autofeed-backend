#! /bin/bash

echo "Starting DIYAutoFeed OS..."

### Pull docker images if needed
if [ -f "/server-image" ]; then
  SERVER_IMAGE=$(cat /server-image)
  echo "Pulling server image $SERVER_IMAGE"

  docker pull $SERVER_IMAGE
  docker tag $SERVER_IMAGE autofeed-server

  rm -f /server-image
fi

if [ -f "/client-image" ]; then
  CLIENT_IMAGE=$(cat /client-image)
  echo "Pulling client image $CLIENT_IMAGE"

  docker pull $CLIENT_IMAGE
  docker tag $CLIENT_IMAGE autofeed-client

  rm -f /client-image
fi

if [ ! "$(docker ps -a | grep autofeed-server)" ]; then
  echo "Initializing Server"
  docker run \
      --name autofeed-server \
      --hostname autofeed-server \
      --restart always \
      -p 8080:8080 \
      --mount type=bind,src=/etc/autofeed/data,dst=/etc/autofeed/data \
      -d autofeed-server node .
fi

if [ ! "$(docker ps -a | grep autofeed-client)" ]; then
  echo "Initializing Client"
  docker run \
      --name autofeed-client \
      --hostname autofeed-client \
      --link autofeed-server \
      --restart always \
      -p 3000:3000 \
      -d autofeed-client yarn start
fi

echo "Boot Complete!"
