import requests
import json
import time
import os

# IP-Addres or Hostname (replace!)
TASMOTA_IP = os.getenv("TASMOTA_IP", "http://power.meter")

# Google Sheets API URL (replace!)
GOOGLE_SHEETS_URL = os.getenv("GOOGLE_SHEETS_URL");

# Timeout between sending the data to google sheets.
TIMEOUT = 10

def get_tasmota_data():
    try:
        # API Request to device
        response = requests.get(f"{TASMOTA_IP}/cm?cmnd=status%208")
        data = response.json()
        
        # Check if data is there
        if "StatusSNS" in data and "Power" in data["StatusSNS"]:
            power_data = data["StatusSNS"]["Power"]
            meter_number = power_data.get("Meter_Number",0)
            total_in = str(power_data.get("Total_in", 0)).replace(".",",")
            power_curr = str(power_data.get("Power_curr", 0)).replace(".",",")
            total_out = str(power_data.get("Total_out", 0)).replace(".",",")

            print(f"Smartmeter: {meter_number} | Consumption: {total_in} kWh | Current Power (Watt): {power_curr} W | Generated Power: {total_out} kWh")

            return meter_number, total_in, power_curr, total_out
        else:
            print("Error: Unknown dateformat of Tasmota!")
            return None, None, None

    except Exception as e:
        print(f"Error while receiving tasmota data: {e}")
        return None, None, None

def send_to_google_sheets(meter_number, total_in, power_curr, total_out):
    try:
        # Send data to google function
        url = f"{GOOGLE_SHEETS_URL}?meter_number={meter_number}&total_in={total_in}&power_curr={power_curr}&total_out={total_out}"
        response = requests.get(url)
        print(f"Google Sheets Response: {response.text}")

    except Exception as e:
        print(f"Error while sending data to google sheets: {e}")

if __name__ == "__main__":
    
    if GOOGLE_SHEETS_URL is None:
        print("Error: You need to set GOOGLE_SHEETS_URL as env var!")
        exit(1)
    
    while True:
        meter_number, total_in, power_curr, total_out = get_tasmota_data()
        if total_in is not None:
            send_to_google_sheets(meter_number, total_in, power_curr, total_out)
        
        print(f"wait {TIMEOUT} secs")
        # Wait 10secs
        time.sleep(TIMEOUT)
