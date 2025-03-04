#!/bin/bash
set -eu

cp nginx.conf /etc/nginx/sites-available/default

cd frontend/

rm -rf dist

npm install

npm run build

rm -rf /var/www/html/*

cp -r dist/* /var/www/html/

systemctl restart nginx

