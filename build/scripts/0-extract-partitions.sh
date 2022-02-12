#! /bin/bash

if [ -z ${PARTITION_TABLE} ]; then
  echo "No partition table filename specified"
  exit 1
fi

if [ -z ${IMAGE_NAME} ]; then
  echo "No image name specified"
  exit 1
fi

if [ -z ${BASE_IMAGE} ]; then
  echo "No base image filename specified"
  exit 1
fi

sfdisk -d ${BASE_IMAGE} > ${PARTITION_TABLE}
losetup -a | grep "${BASE_IMAGE}" | awk -F: '{ print $1 }' | xargs -r losetup -d
losetup -fP ${BASE_IMAGE}

DEV=$(losetup -a | grep "${BASE_IMAGE}" | awk -F: '{ print $1 }')

# Extract Boot Partition
mount ${DEV}p1 $MNT_DIR
tar cf boot.tar -C $MNT_DIR --numeric-owner .
chown $(whoami) boot.tar
. ./build/scripts/umount.sh

# Extract Root Partition
mount ${DEV}p2 $MNT_DIR
tar cf root.tar -C $MNT_DIR --numeric-owner .
chown $(whoami) root.tar
. ./build/scripts/umount.sh

. ./build/scripts/losetup-clear.sh
