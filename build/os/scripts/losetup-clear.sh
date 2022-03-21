#! /bin/bash

if [ -n ${DEV} ]; then
  losetup -d ${DEV}
fi
