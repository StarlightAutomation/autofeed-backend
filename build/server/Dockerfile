FROM node:16

RUN mkdir -p /tmp/server
WORKDIR /tmp/server

COPY ./server /tmp/server

RUN apt update -y
RUN yarn install --network-timeout 100000 && yarn build

RUN mkdir -p /etc/autofeed/app && \
    mkdir /etc/autofeed/data && \
    mkdir /etc/autofeed/py-scripts

RUN mv build /etc/autofeed/app && \
    mv node_modules /etc/autofeed/app && \
    mv package.json /etc/autofeed/app

COPY ./scripts/*.py /etc/autofeed/py-scripts
COPY ./data/environment/env.server /etc/autofeed/app/.env

WORKDIR /etc/autofeed/app
RUN rm -rf /tmp/server

EXPOSE 8080

CMD []
