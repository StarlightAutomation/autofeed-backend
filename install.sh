#! /bin/bash
# Initial installation script

### WARNING ###
# Do not modify this script if you do not know what you are doing.
# END USERS: Do not modify.
# END USERS: Do not run manually.

PYTHON_SCRIPT_PATH=/etc/autofeed/py-scripts
APPLICATION_PATH=/etc/autofeed/app
CLIENT_PATH=/etc/autofeed/client
DATA_PATH=/etc/autofeed/data

echo "Installing Prerequisites..."
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -
apt install nodejs -y
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update -y
apt install --no-install-recommends -y yarn

mkdir -p $PYTHON_SCRIPT_PATH
mkdir -p $APPLICATION_PATH
mkdir -p $CLIENT_PATH
mkdir -p $DATA_PATH

echo "Installing Scripts..."
mv scripts/** $PYTHON_SCRIPT_PATH

echo "Building Server..."
cd server && yarn install && yarn build && cd -
mv server/build $APPLICATION_PATH
mv server/node_modules $APPLICATION_PATH
mv server/package.json $APPLICATION_PATH
mv server/yarn.lock $APPLICATION_PATH

echo "Building Client..."
cd client && yarn install && yarn build && yarn generate && cd -
mv client/dist/** $CLIENT_PATH

echo "Moving Data..."
mv data/base_configuration.json $DATA_PATH
mv data/autofeed-server.service /lib/systemd/system

chmod 644 /lib/systemd/system/autofeed-server.service
systemctl daemon-reload
systemctl enable autofeed-server.service
