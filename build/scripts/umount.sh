#! /bin/bash

if [ -z ${MNT_DIR} ]; then
  echo "No mount directory specified."
  exit 1
fi

if grep -qs ${MNT_DIR} /proc/mounts; then
  umount ${MNT_DIR}
fi
