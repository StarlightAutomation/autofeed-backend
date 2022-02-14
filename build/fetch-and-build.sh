#! /bin/bash

PACKAGE=(${1//-/ })
RELEASE=${PACKAGE[0]}
ARCH=${PACKAGE[1]}

USER=$(whoami)
if [[ ${USER} != "root" ]]; then
  echo "User: ${USER}"
  echo "Please run as root."
fi

echo "Fetching base image..."
BASE_IMAGE=$(./build/scripts/get-base-image.sh ${RELEASE} ${ARCH})
EXIT=$?

if [ ${EXIT} == 1 ]; then
  echo "Unable to fetch base image for: ${RELEASE} ${ARCH}bit"
  exit 1
fi

echo "Fetched base image: ${BASE_IMAGE}"
. ./build/build.sh
