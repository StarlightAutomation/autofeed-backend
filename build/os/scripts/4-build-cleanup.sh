#! /bin/bash

if [ -n ${PARTITION_TABLE} ]; then
  rm -f ./${PARTITION_TABLE}
fi

if [ -n ${BASE_IMAGE} ]; then
  rm -f ${BASE_IMAGE}
fi

rm -f ./boot.tar
rm -f ./root.tar
rm -f ./custom-root.tar
