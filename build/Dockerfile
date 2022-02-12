FROM scratch

USER root
ADD root.tar /

# Install OS dependencies
RUN apt-get update -y

RUN curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -
RUN apt install nodejs -y
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
RUN sudo apt update -y
RUN apt install --no-install-recommends -y yarn

# Directory Structure
RUN mkdir -p /etc/autofeed
RUN mkdir /etc/autofeed/data
RUN mkdir /etc/autofeed/app
RUN mkdir /etc/autofeed/py-scripts

WORKDIR /tmp/autofeed
ADD . /tmp/autofeed

COPY ./scripts/** /etc/autofeed/py-scripts/

# Build Server
RUN cd server && yarn install && yarn build && \
    mv build /etc/autofeed/app && \
    mv node_modules /etc/autofeed/app && \
    mv package.json /etc/autofeed/app && \
    cd -

# Move Data
COPY ./data/base_configuration.json /etc/autofeed/data
COPY ./data/autofeed-server.service /lib/systemd/system
COPY ./data/init.sh /etc/autofeed/init.sh

RUN chmod +x /etc/autofeed/init.sh
RUN chmod 644 /lib/systemd/system/autofeed-server.service

WORKDIR /etc/autofeed
RUN rm -rf /tmp/autofeed
