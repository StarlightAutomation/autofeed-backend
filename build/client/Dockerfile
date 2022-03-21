FROM node:16

RUN mkdir -p /tmp/client
WORKDIR /tmp/client

COPY ./client /tmp/client

RUN apt update -y
RUN yarn install --network-timeout 100000 && yarn build

RUN mkdir -p /etc/autofeed/client

RUN mv node_modules /etc/autofeed/client && \
    mv assets /etc/autofeed/client && \
    mv nuxt.config.js /etc/autofeed/client && \
    mv package.json /etc/autofeed/client && \
    mv .nuxt /etc/autofeed/client

COPY ./data/environment/env.client /etc/autofeed/client/.env

WORKDIR /etc/autofeed/client
RUN rm -rf /tmp/client

EXPOSE 3000

CMD []
