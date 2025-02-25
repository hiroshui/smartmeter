# ⚡ Tasmota Smart Meter Logger (Dockerized) 🐳

This privatly build project enables logging of power consumption and feed-in data from a **Tasmota Smart Meter** and automatically sends the values to **Google Sheets**.  
The script runs in a **Docker container** and is easily configurable using **environment variables**.

This setup is based on the **stromleser.de** reader and utilizes the following configuration for an **Itron Smart Meter**.

Tasmota Script for Itron Smart Meter:
```plaintext
>D
>B
=>sensor53 r
;Set teleperiod to 20sec  
tper=10  
>M 1
+1,3,s,0,9600,Power,1
1,77070100600100ff@#,Smartmeter Number,,Meter_Number,0
1,77070100010800ff@1000,Consumption,kWh,Total_in,4
1,77070100100700ff@1,Current,W,Power_curr,0
1,77070100020800ff@1000,Generated,kWh,Total_out,4
#
```

---

## 📁 **Project Structure**
```
/tasmota-logger
│── Dockerfile               # Docker image definition
│── docker-compose.yml       # Easy management with Docker Compose
│── send-tasmota.py          # Python script for data retrieval & logging
│── tasmota.script           # Tasmota script for Itron, others can be found here https://stromleser.de/pages/scripts or https://tasmota.github.io/docs/Smart-Meter-Interface/
│── README.md                # Project documentation
```

---

## 🚀 **Setup & Installation**

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/your-repo/tasmota-logger.git
cd tasmota-logger
```

### **2️⃣ Configure Environment Variables**
This project uses **two environment variables** to customize the setup:
- `TASMOTA_IP` → The IP address of your Tasmota Smart Meter.
- `GOOGLE_SHEETS_URL` → The Google Sheets API endpoint to log the data.

You can set them when running the Docker container or via `docker-compose.yml`.

---

## 🐳 **Running with Docker**
### **Option 1: Build and Run with Docker**
Build the Docker image:
```bash
docker build -t tasmota-logger .
```
Run the container:
```bash
docker run -d --restart unless-stopped \
  --name tasmota-logger \
  -e TASMOTA_IP="http://192.168.X.X" \
  -e GOOGLE_SHEETS_URL="https://script.google.com/macros/s/YOUR-API/exec" \
  tasmota-logger
```
💡 The container **runs in the background**, continuously logging data every **10 seconds**.

---

### **Option 2: Running with Docker Compose (Recommended)**
Using **Docker Compose**, you can manage everything in a single file.

#### **1️⃣ Edit `docker-compose.yml`**
```yaml
version: '3'
services:
  tasmota-logger:
    image: tasmota-logger
    container_name: tasmota-logger
    restart: unless-stopped
    environment:
      - TASMOTA_IP=http://192.168.1.100
      - GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR-API/exec
```

#### **2️⃣ Start the container**
```bash
docker-compose up -d
```

#### **3️⃣ Check logs**
```bash
docker logs -f tasmota-logger
```

---

## 🔄 **Updating the Container**
If you make changes to `send-tasmota.py`, you need to rebuild the Docker image:
```bash
docker build -t tasmota-logger .
docker stop tasmota-logger && docker rm tasmota-logger
docker run -d --restart unless-stopped --name tasmota-logger tasmota-logger
```
or with Docker Compose:
```bash
docker-compose up -d --build
```

---

## 📊 **How It Works**
1. The script fetches data from the **Tasmota Smart Meter** API:
   ```http
   http://TASMOTA_IP/cm?cmnd=status%208
   ```
2. Extracts **meter number, power consumption, current power, and feed-in energy**.
3. Sends the data to **Google Sheets** via a Web API:
   ```http
   https://script.google.com/macros/s/YOUR-API/exec
   ```

---

## 🛑 **Stopping & Removing the Container**
To **stop** and **remove** the container:
```bash
docker stop tasmota-logger
docker rm tasmota-logger
```

To remove **all unused Docker images and containers**:
```bash
docker system prune -a
```

---

## ⚠️ **Troubleshooting**
❓ **Issue:** No data appears in Google Sheets?  
✔️ **Solution:** Ensure the Google API URL is correct and publicly accessible.

❓ **Issue:** Wrong number formatting in Google Sheets?  
✔️ **Solution:** Google Sheets might use the wrong decimal separator. Try adjusting the **regional settings** to **"United States"** in Google Sheets.

❓ **Issue:** Container crashes or stops?  
✔️ **Solution:** Run `docker logs -f tasmota-logger` to check for errors.

---
