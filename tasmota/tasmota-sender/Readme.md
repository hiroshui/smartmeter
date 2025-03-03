# ⚡ Tasmota Smart Meter Logger (Dockerized) 🐳

This privatly build project enables logging of power consumption and feed-in data from a **Tasmota Smart Meter** and automatically sends the values to **Google Sheets**.  
The script runs in a **Docker container** and is easily configurable using **environment variables**.

This setup is based on the **stromleser.de** reader and utilizes the following configuration for an **Itron Smart Meter**.

---

## 📁 **Project Structure**
```
/tasmota-logger
│── Dockerfile               # Docker image definition
│── docker-compose.yml       # Easy management with Docker Compose
│── send-tasmota.py          # Python script for data retrieval & logging
│── tasmota.script           # Tasmota configuration script for Itron SM - others for other smart meters can be found here https://stromleser.de/pages/scripts or https://tasmota.github.io/docs/Smart-Meter-Interface/
│── README.md                # Project documentation
```

The Tasmota configuration script (`tasmota.script`) contains the necessary settings for the Itron Smart Meter and can be modified for other smart meters if needed.

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
  -e TASMOTA_IP="http://192.168.1.100" \
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

## 📊 **Google Sheets Integration**
Without Google Sheets the script wont work, because it sends the data to a spreedsheet trough a AppsScript to easily visualize the diagramm using basic Spreadsheet funcitonality.

### **1️⃣ Create a Google Sheet**
- Open [Google Sheets](https://docs.google.com/spreadsheets/) and create a new sheet.
- Copy the **Spreadsheet ID** from the URL (it's the long string between `/d/` and `/edit`).

### **2️⃣ Add an Apps Script**
- Click on **Extensions** → **Apps Script**.
- Replace the default code with:

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.openById("YOUR_SPREADSHEET_ID").getActiveSheet();
  sheet.appendRow([new Date(), e.parameter.meter_number, e.parameter.total_in, e.parameter.power_curr, e.parameter.total_out]);
  return ContentService.createTextOutput("OK");
}
```
- Replace `YOUR_SPREADSHEET_ID` with the actual ID of your Google Sheet.

### **3️⃣ Deploy as Web App**
- Click **Deploy** → **New Deployment**.
- Select **Web App**.
- Set "Who has access" to **Anyone**.
- Copy the deployment URL and use it as `GOOGLE_SHEETS_URL` in your `.env` file or Docker setup.

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
