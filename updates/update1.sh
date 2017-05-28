#!/bin/bash

cp ./files/osjs.service /etc/systemd/system/osjs.service
cp ./files/repsonse.php /usr/share/webapps/nextcloud/lib/private/legacy/response.php
sudo -u http /usr/share/webapps/nextcloud/occ config:app:set "richdocuments" '"wopi_url": "https://shmc-server"'


reboot
