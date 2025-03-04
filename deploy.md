# To install and prepare nginx
```
sudo apt update && sudo apt install nginx -y

sudo cp nginx.conf /etc/ngnix/site-available/default



```

# Deploy tasmota-cors-proxy

```
pm2 start /home/apps/smartmeter/apps/proxy/proxy.js --name tasmota-proxy
pm2 save
pm2 startup
pm2 status
```

# if you are ready, run build and deploy services to nginx
```

cd frontend

npm run build 

sudo cp dist/* /var/www/html/

sudo systemctl restart nginx
```


