#!/bin/bash
set -eu

# tbd: check if nginx is already installed.

cp nginx.conf /etc/nginx/sites-available/default

rm -rf /var/www/html/*

cp -r frontend/dist/* /var/www/html/

systemctl restart nginx
