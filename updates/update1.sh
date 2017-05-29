#!/bin/bash

cp /SHMC/updates/files/osjs.service /etc/systemd/system/osjs.service
cp /SHMC/updates/files/response.php /usr/share/webapps/nextcloud/lib/private/legacy/response.php
cp /SHMC/updates/files/nextcloud_htaccess /usr/share/webapps/nextcloud/.htaccess
cp /SHMC/updates/files/documents.js /usr/share/webapps/nextcloud/apps/richdocuments/js/documents.js
cp /SHMC/updates/files/viewer.js /usr/share/webapps/nextcloud/apps/richdocumentes/js/viewer/viewer.js
sudo -u http /usr/share/webapps/nextcloud/occ config:app:set "richdocuments" '"wopi_url": "https://shmc-server"'
node /SHMC/OSjs/osjs build:package --name=default/FileManager
node /SHMC/OSjs/osjs build:manifest
usermod -a -G http emby
systemctl daemon-reload
reboot
