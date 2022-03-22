#! /bin/bash

systemctl daemon-reload
systemctl enable docker
systemctl enable boot

rm -f /etc/autofeed/init.sh

sleep 60
