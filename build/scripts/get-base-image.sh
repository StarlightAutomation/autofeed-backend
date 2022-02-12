#! /bin/bash

ARCH=$2
RELEASE=$1

FILENAME=raspbian-${RELEASE}-${ARCH}.img

if [[ ${RELEASE} == "bullseye" ]]; then
  if [ ${ARCH} == "32" ]; then
    URL=https://downloads.raspberrypi.org/raspios_lite_armhf/images/raspios_lite_armhf-2022-01-28/2022-01-28-raspios-bullseye-armhf-lite.zip
  fi
  if [[ ${ARCH} == "64" ]]; then
    URL=https://downloads.raspberrypi.org/raspios_lite_arm64/images/raspios_lite_arm64-2022-01-28/2022-01-28-raspios-bullseye-arm64-lite.zip
  fi
fi

if [[ ${RELEASE} == "buster" ]]; then
  URL=https://downloads.raspberrypi.org/raspios_oldstable_lite_armhf/images/raspios_oldstable_lite_armhf-2022-01-28/2022-01-28-raspios-buster-armhf-lite.zip
fi

if [ -z ${URL} ]; then
  echo "Invalid args!"
  exit 1
fi

curl -s -o raspbian.zip ${URL}
unzip -qq raspbian.zip
mv *-raspios-*.img ${FILENAME}

echo ${FILENAME}
