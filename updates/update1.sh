#!/bin/bash

rm -r /SHMC/OSjs/src/packages/default/VNC/
rm -r /SHMC/OSjs/src/packages/default/Firefox/
node /SHMC/OSjs/osjs build:manifest
systemctl restart osjs &
reboot
