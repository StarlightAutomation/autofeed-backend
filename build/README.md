# Build Process

The build process for server, client, and OS is located here. There are 3 components:
1. OS - the OS image
2. Server - the API application
3. Client - the UI application

### OS

The OS - or operating system - is based on Raspbian and is responsible for running both the Client
and Server apps. The OS isn't built as a docker image, but rather uses docker to assist in building
a Raspberry Pi disk image. Docker is used to run the Client and Server apps, so the OS is equipped
with docker to facilitate starting and stopping containers, pulling images, etc.

That is the role of the OS: to provide a way for the server and client docker containers to auto-start
and stay running.

### Server

This is the API application that handles scheduling, configuration read/write, etc. This app is intended
to run as a docker container.

### Client

This is the UI application that interfaces with the API. This app is also intended to run as a docker
container.

---

## Building the Client/Server

Building Client or Server images is relatively easy and won't require any special setup aside from 
having the docker daemon running on your machine. The Dockerfile for the Client and Server is located
at `build/client/Dockerfile` and `build/server/Dockerfile` respectively.

To build these images locally, you may run the following commands:
```
# To build the client
docker build -f build/client/Dockerfile .

# To build with a tag
docker build -f build/client/Dockerfile -t autofeed-client .
```

```
# To build the server
docker build -f build/server/Dockerfile .

# To build with a tag
docker build -f build/server/Dockerfile -t autofeed-client .
```

#### Ports
* Server Port: `8080`
* Client Port: `3000`

#### Volumes
* Server requires a bind mount with a `base_configuration.json` in it, mounted in the container as
`/etc/autofeed/data`

To start the server container for example:
```
docker run -it \
    --mount type=bind,src=/path/to/your/host/data/dir,dst=/etc/autofeed/data \
    -p 8080:8080 \
    autofeed-server node .
```

To start the client, simply provide the port mapping:
```
docker run -it \
    -p 3000:3000 \
    autofeed-client node .
```

---

## Building the OS

The OS build process is intended to install some packages and move some data into a base Raspbian
image that can then be flashed to a Raspberry Pi. The OS itself is really only responsible for running
docker containers, which the server and client run inside of. Therefore the OS build process will
not move any application data directly into the image, but rather will setup Docker and required
dependencies, create the app directory structure/move configuration data, then pull the desired
server/client images so they'll be ready to start on next first boot.

An overview of the build process:
1. Extract root and boot partitions from a Raspbian image
2. Mount the root partition as the filesystem root in a Docker build context
3. Install Docker within the "image", and install other dependencies/setup application
4. Run the result image's `init.sh` script, which will setup the server/client containers
5. Export the container from the previous run (to obtain customized root filesystem)
6. Build resulting filesystem into new `.img` file

The "container automation" happens in steps 3 and 4 - enabling the server/client containers to run
on boot.

The intention with running the apps as containers is to allow them to be easily upgradeable without
needing to flash a new OS image. As the software changes, disassembling hardware will become more
tedious and it would be easier to just update OTA.

### Actual Build Process

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
