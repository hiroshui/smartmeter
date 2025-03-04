#!/bin/bash
set -eu

cp nginx.conf /etc/nginx/sites-available/default

cd frontend/

npm install

npm run build

rm -rf /var/www/html

cp dist/* /var/www/html/

systemctl restart nginx

