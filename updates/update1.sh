#!/bin/bash

cp /SHMC/updates/files/osjs.service /etc/systemd/system/osjs.service
cp /SHMC/updates/files/response.php /usr/share/webapps/nextcloud/lib/private/legacy/response.php
sudo -u http /usr/share/webapps/nextcloud/occ config:app:set "richdocuments" '"wopi_url": "https://shmc-server"'
node /SHMC/OSjs/osjs build:package --name=default/FileManager
node /SHMC/OSjs/osjs build:manifest
systemctl daemon-reload
reboot
