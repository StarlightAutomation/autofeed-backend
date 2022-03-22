#! /bin/bash

if [ -z ${IMAGE_NAME} ]; then
  echo "No image name specified"
  exit 1
fi

if [ -z ${PARTITION_TABLE} ]; then
  echo "No partition table filename specified"
  exit 1
fi

if [ -z ${IMAGE_SIZE} ]; then
  echo "No image size specified. Defaulting to 4G"
  IMAGE_SIZE=4096
fi

losetup -a | grep "${IMAGE_NAME}" | awk -F: '{ print $1 }' | xargs -r losetup -d
dd if=/dev/zero of=./${IMAGE_NAME} bs=1M count=${IMAGE_SIZE}
sfdisk ${IMAGE_NAME} < ${PARTITION_TABLE}
losetup -fP ${IMAGE_NAME}
DEV=$(losetup -a | grep "${IMAGE_NAME}" | awk -F: '{ print $1 }')

CONTAINER=$(docker run -d --rm diyautofeed:latest /etc/autofeed/init.sh)

# Ensures full init.sh script runs
sleep 10
docker export ${CONTAINER} > custom-root.tar
