#! /bin/bash

set -e
set -x

# Default Variables
if [ -z ${BASE_IMAGE} ]; then
  BASE_IMAGE="raspbian.img"
fi
if [ -z ${IMAGE_NAME} ]; then
  IMAGE_NAME="autofeed.img"
fi
if [ -z ${PARTITION_TABLE} ]; then
  PARTITION_TABLE="pt.txt"
fi
if [ -z ${IMAGE_SIZE} ]; then
  IMAGE_SIZE=4096
fi

MNT_DIR=/mnt/autofeed
mkdir -p ${MNT_DIR}

echo ${PARTITION_TABLE}

echo "Installing Prerequisites"
apt install -y qemu-user-static

# EXTRACT PARTITIONS
echo "Extracting Partitions"
. ./build/scripts/0-extract-partitions.sh

# BUILD DOCKER IMAGE
echo "Building Docker Image"
. ./build/scripts/1-build-docker.sh

# INIT PI IMAGE
echo "Initializing Raspberry Pi Disk Image"
. ./build/scripts/2-init-pi-image.sh

# PI IMAGE PARTITIONS
echo "Building Disk Image Partitions"
. ./build/scripts/3-pi-partitions.sh

. ./build/scripts/4-build-cleanup.sh
echo "Build complete: ${IMAGE_NAME}"
