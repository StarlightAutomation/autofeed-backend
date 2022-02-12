#! /bin/bash

systemctl daemon-reload
systemctl enable autofeed-server.service

rm -f /etc/autofeed/init.sh
sleep 60
