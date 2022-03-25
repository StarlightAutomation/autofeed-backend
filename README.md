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

[Documentation](https://github.com/StarlightAutomation/autofeed-backend/wiki)

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

## Build Processes

[Build Documentation](./build/README.md)