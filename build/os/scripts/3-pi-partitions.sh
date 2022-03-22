#! /bin/bash

if [ -z ${DEV} ]; then
  echo "No loopback device specified"
  exit 1
fi

# Create boot partition and sync boot.tar from base image
mkfs.fat ${DEV}p1
mount ${DEV}p1 ${MNT_DIR}
tar xf boot.tar -C ${MNT_DIR} --numeric-owner
. ./build/os/scripts/umount.sh

# Create then resize root partition for new data
mkfs.ext4 ${DEV}p2
parted ${DEV} resizepart 2 ${IMAGE_SIZE}M
e2fsck -f ${DEV}p2 -y
resize2fs ${DEV}p2

# The disk ID changes after repartitioning. This must then be updated in both boot and root partitions
DISKID=$(blkid ${IMAGE_NAME} | grep -o -P '(?<=PTUUID=").*(?=" PTTYPE)')

# Replace old disk ID to root partition in boot/cmdline.txt
mount ${DEV}p1 ${MNT_DIR}
cp ./data/cmdline.txt ./data/cmdline.txt.tmp
sed -i "s/<DISK-ID>/${DISKID}/g" ./data/cmdline.txt.tmp
rm -f ${MNT_DIR}/cmdline.txt
cp --no-preserve=mode,ownership ./data/cmdline.txt.tmp ${MNT_DIR}/cmdline.txt
rm -f ./data/cmdline.txt.tmp
. ./build/os/scripts/umount.sh

mount ${DEV}p2 ${MNT_DIR}
tar xf custom-root.tar -C ${MNT_DIR} --numeric-owner

# Replace old disk IDs in root partition fstab
cp ./data/fstab ./data/fstab.tmp
sed -i "s/<DISK-ID>/${DISKID}/g" ./data/fstab.tmp
mv ./data/fstab.tmp ${MNT_DIR}/etc/fstab
. ./build/os/scripts/umount.sh

. ./build/os/scripts/losetup-clear.sh
