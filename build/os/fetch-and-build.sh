#! /bin/bash

PACKAGE=(${1//-/ })
RELEASE=${PACKAGE[0]}
ARCH=${PACKAGE[1]}

if [ -z $SERVER_IMAGE ]; then
    echo "SERVER_IMAGE is required"
    exit 1
fi
if [ -z $CLIENT_IMAGE ]; then
    echo "CLIENT_IMAGE is required"
    exit 1
fi

USER=$(whoami)
if [[ ${USER} != "root" ]]; then
  echo "User: ${USER}"
  echo "Please run as root."
fi

echo "Fetching base image..."
BASE_IMAGE=$(./build/os/scripts/get-base-image.sh ${RELEASE} ${ARCH})
EXIT=$?

if [ ${EXIT} == 1 ]; then
  echo "Unable to fetch base image for: ${RELEASE} ${ARCH}bit"
  exit 1
fi

echo "Fetched base image: ${BASE_IMAGE}"
. ./build/os/build.sh
