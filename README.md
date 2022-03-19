# DIYAutoFeed

Complete backend/frontend system for DIYAutoFeed compatible reservoir systems.

### Table of Contents

1. [End Users](#end-users)
2. [Developers](#developers)
   1. [Applications](#applications)
   2. [Local Development Setup](#local-development-setup)
      1. [Server Setup](#server-setup)
      2. [Client Setup](#client-setup)
3. [Build Process](#build-process)

---

## End Users

Looking for a download? DIYAutoFeed is able to run on most Raspberry Pi versions, and has been
tested on the 3 and 4. 64 bit downloads are available for supported devices as well.

Check the Releases page for image downloads: https://github.com/StarlightAutomation/autofeed-backend/releases

---

## Developers

Interested in contributing to the DIYAutoFeed software system? Check out the contribution guidelines first.

### Applications

DIYAutoFeed comprises two applications:
* Server - the API server that manages the configuration and calls service scripts
* Client - the UI (user interface) application that is accessible via the web

### Local Development Setup

#### Server Setup

#### Docker
##### Install Dependencies
```
bin/server/yarn install
```

You can then start the server with:
```
docker-compose up
```

#### No Docker
First, create a `.env` file in the `server/` directory. Copy the contents of `.env.example` to the
new `.env` file.

* `DATA_DIR` - The path to `data/`. For local development this can be `../data`
* `APP_DIR` - The path to the application. For local development, set `./`
* `SCRIPTS_DIR` - The path to Python scripts. For local development, set `../scripts`

##### Install Dependencies
```
cd server
yarn install
```

You can then start the server with (from the `server/` directory):
```
yarn start
```

#### Client Setup

#### Docker
##### Install Dependencies
```
bin/client/yarn install
```

You can then start the client with:
```
docker-compose up
```

#### No Docker
First, create a `.env` file in the `client/` directory. Copy the contents of `.env.example` to the
new `.env` file.

* `API_URL` - The URL to the autofeed-server. This can be set to `http://localhost:8080`

##### Install Dependencies
```
cd client
yarn install
```

You can then start the client with (from the `client/` directory):
```
yarn dev
```

---

## Build Process

DIYAutoFeed disk images are build for the Raspberry Pi. You are able to build your own image if you'd like. The
build process makes use of Docker in order to install and move data around.

The `Dockerfile` is located at: `./build/Dockerfile`

The build process itself comprises several steps:
1. Fetch `raspbian` image - this will pull the desired image (bullseye 32/64, buster 32)
   1. Script: `./build/scripts/get-base-image.sh {bullseye|buster} {32|64}`
2. Extract `boot` and `root` partitions from the `raspbian` image
   1. Script: `./build/scripts/0-extract-partitions.sh`
3. Build docker image using extracted `root` partition. This allows docker to operate within the `raspbian` OS
   1. Script: `./build/scripts/1-build-docker.sh`
4. Initialize the Pi disk image. This involves creating a blank `autofeed.img` image file, importing the
`raspbian` image partition table, then exporting the previously created Docker image to a `custom-root.tar` archive.
   1. Script: `./build/scripts/2-init-pi-image.sh`
5. Partition the Pi disk image. This will resize the `root` partition of the `autofeed.img` image. This is necessary
to accommodate software installation during docker build. This step will also mount the new partitions and import
the existing `boot` partition and the new `custom-root.tar` as the new `root` partition.
   1. Script: `./build/scripts/3-pi-partitions.sh`
   2. This step also writes the correct disk UUID to `boot:/cmdline.txt` and to `root:/etc/fstab`. This is
   necessary for the device to boot properly.
6. Build cleanup: delete all files related to the build (except `autofeed.img`)
   1. Script: `./build/scripts/4-build-cleanup.sh`

To run a full build, run one of:
```
sudo ./build/fetch-and-build.sh bullseye 32 # Builds image from Bullseye 32 bit
sudo ./build/fetch-and-build.sh bullseye 64 # Builds image from Bullseye 64 bit
sudo ./build/fetch-and-build.sh buster 32 # Builds image from Buster 32 bit
```

#### Image Size

As mentioned in step #5 above, the build process will install additional software, data, and dependencies. This
means that the resulting image will be larger than the existing `root` partition (which was copied from the 
original `raspbian` image, ~2GB).

The default image size is `4G`. This will create a `4G` `autofeed.img` image file as well as expand the `root`
partition of that image to `4G`. If your custom build adds additional data to the image, you may need to increase
the image size.

This can be done with:
```
sudo IMAGE_SIZE=4096 ./build/fetch-and-build.sh ... # Specifies image size of 4G
```
(Image size is in MB)

You can get a good idea of your image size based on the size of `custom-root.tar`. Take this filesize and
add some overhead to it, ~512-768MB. This is a good starting place for a new `IMAGE_SIZE`. If the specified
size is not large enough, the `3-pi-partitions.sh` step will fail with a `No space left on device` message
when trying to copy `custom-root.tar` to the new root partition. This is an indication that a larger
`IMAGE_SIZE` is needed.