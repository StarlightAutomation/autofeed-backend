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
if [ -z ${SERVER_IMAGE} ]; then
  echo "No SERVER_IMAGE set!"
  exit 1
fi
if [ -z ${CLIENT_IMAGE} ]; then
  echo "No CLIENT_IMAGE set!"
  exit 1
fi

MNT_DIR=/mnt/autofeed
mkdir -p ${MNT_DIR}

echo ${PARTITION_TABLE}

echo "Installing Prerequisites"
apt update -y
apt install -y qemu-user-static

# EXTRACT PARTITIONS
echo "Extracting Partitions"
. ./build/os/scripts/0-extract-partitions.sh

# BUILD DOCKER IMAGE
echo "Building Docker Image"
. ./build/os/scripts/1-build-docker.sh

# INIT PI IMAGE
echo "Initializing Raspberry Pi Disk Image"
. ./build/os/scripts/2-init-pi-image.sh

# PI IMAGE PARTITIONS
echo "Building Disk Image Partitions"
. ./build/os/scripts/3-pi-partitions.sh

. ./build/os/scripts/4-build-cleanup.sh
echo "Build complete: ${IMAGE_NAME}"
