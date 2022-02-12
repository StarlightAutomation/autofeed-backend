#! /bin/bash

if [ -n ${PARTITION_TABLE} ]; then
  rm -f ./${PARTITION_TABLE}
fi

rm -f ./boot.tar
rm -f ./root.tar
rm -f ./custom-root.tar
