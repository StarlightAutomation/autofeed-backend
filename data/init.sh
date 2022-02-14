#! /bin/bash

systemctl daemon-reload

systemctl enable autofeed-server.service
systemctl enable autofeed-client.service

rm -f /etc/autofeed/init.sh
sleep 60
