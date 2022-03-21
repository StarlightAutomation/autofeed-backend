#! /bin/bash

systemctl daemon-reload
systemctl enable docker

docker run \
    --restart always \
    -p 8080:8080 \
    --mount type=bind,src=$DATA_DIR,dst=$DATA_DIR
    -d autofeed-server

docker run \
    --restart always \
    -p 3000:3000
    -d autofeed-client

rm -f /etc/autofeed/init.sh
sleep 60
