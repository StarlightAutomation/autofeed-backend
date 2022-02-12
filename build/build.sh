#! /bin/bash

set -e
set -x

BASE_IMAGE="raspbian.img"
IMAGE_NAME="autofeed.img"
PARTITION_TABLE="pt.txt"
IMAGE_SIZE=4096
MNT_DIR=/mnt/autofeed

mkdir -p /mnt/autofeed

echo "Installing Prerequisites"
apt install -y qemu-user-static

# EXTRACT PARTITIONS
echo "Extracting Partitions"

sfdisk -d ${BASE_IMAGE} > ${PARTITION_TABLE}
losetup -a | grep "${BASE_IMAGE}" | awk -F: '{ print $1 }' | xargs -r losetup -d
losetup -fP ${BASE_IMAGE}

DEV=$(losetup -a | grep "${BASE_IMAGE}" | awk -F: '{ print $1 }')

# Extract Boot Partition
mount ${DEV}p1 $MNT_DIR
tar cf boot.tar -C $MNT_DIR --numeric-owner .
chown $(whoami) boot.tar
umount $MNT_DIR

# Extract Root Partition
mount ${DEV}p2 $MNT_DIR
tar cf root.tar -C $MNT_DIR --numeric-owner .
chown $(whoami) root.tar
umount $MNT_DIR

losetup -d ${DEV}

# BUILD DOCKER IMAGE
echo "Building Docker Image"
docker build -t diyautofeed:latest -f build/Dockerfile .

# BUILD PI IMAGE
echo "Building Raspberry Pi Image"
losetup -a | grep "${IMAGE_NAME}" | awk -F: '{ print $1 }' | xargs -r losetup -d
dd if=/dev/zero of=./${IMAGE_NAME} bs=1M count=${IMAGE_SIZE}
sfdisk ${IMAGE_NAME} < ${PARTITION_TABLE}
losetup -fP ${IMAGE_NAME}
DEV=$(losetup -a | grep "${IMAGE_NAME}" | awk -F: '{ print $1 }')

CONTAINER=$(docker run -d --rm diyautofeed:latest sleep 60)
docker export ${CONTAINER} > custom-root.tar

mkfs.fat ${DEV}p1
mount ${DEV}p1 $MNT_DIR
tar xf boot.tar -C $MNT_DIR --numeric-owner
umount $MNT_DIR

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
umount ${MNT_DIR}

mount ${DEV}p2 ${MNT_DIR}
tar xf custom-root.tar -C ${MNT_DIR} --numeric-owner

# Replace old disk IDs in root partition fstab
cp ./data/fstab ./data/fstab.tmp
sed -i "s/<DISK-ID>/${DISKID}/g" ./data/fstab.tmp
mv ./data/fstab.tmp ${MNT_DIR}/etc/fstab
umount ${MNT_DIR}

losetup -d ${DEV}
