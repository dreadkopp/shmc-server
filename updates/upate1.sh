#!/bin/bash

cp ./files/osjs.service /etc/systemd/system/osjs.service
cp ./files/repsonse.php /usr/share/webapps/nextcloud/lib/private/legacy/response.php


reboot
