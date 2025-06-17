import requests
import time
import csv
from datetime import datetime, date

# === CONFIGURATION ===
TASMOTA_API = "https://smart-dashboard.hiroshui.men/api/tasmota"
TAPO_API = "https://smart-dashboard.hiroshui.men/tapo"
AUTH_PASSWORD = "****"  # <-- insert your real password
DEVICE_NAME = "Computer"
DEVICE_TYPE = "p110"

POLL_INTERVAL = 5  # seconds (15 minutes)
POWER_ON_THRESHOLD = -200   # turn on below -200 W (feed-in)
POWER_OFF_THRESHOLD = 100   # turn off above +100 W (grid usage)
ACTIVE_HOURS_START = 8   # from 08:00
ACTIVE_HOURS_END = 20    # until 20:00

LOG_FILE = "heating_rod_log.csv"
active_seconds = 0
last_log_date = date.today()


# === HELPERS ===
def is_within_active_hours(start_hour, end_hour):
    current_hour = datetime.now().hour
    return start_hour <= current_hour < end_hour

def get_token():
    try:
        response = requests.post(
            f"{TAPO_API}/login",
            json={"password": AUTH_PASSWORD}
        )
        response.raise_for_status()
        return response.text.strip()
    except Exception as e:
        print(f"[ERROR] Failed to retrieve token: {e}")
        return None

def get_power():
    try:
        response = requests.get(TASMOTA_API)
        response.raise_for_status()
        data = response.json()
        power = data["StatusSNS"]["Power"]["Power_curr"]
        return float(power)
    except Exception as e:
        print(f"[ERROR] Failed to retrieve power value: {e}")
        return None

def get_device_info(token, type, name):
    action_url = f"/actions/{type}/get-device-info?device={name}"
    try:
        response = requests.get(
            f"{TAPO_API}{action_url}",
            headers={"Authorization": f"Bearer {token}"}
        )
        response.raise_for_status()
        data = response.json()
        if "device_on" in data:
            is_on = data["device_on"]
            print(f"[DEBUG] Device is currently: {'ON' if is_on else 'OFF'}")
            return is_on
        print("[WARN] Could not determine device state.")
        return None
    except Exception as e:
        print(f"[ERROR] Failed to retrieve device state: {e}")
        return None

def switch_device(token, turn_on, type, name):
    try:
        endpoint = "on" if turn_on else "off"
        action_url = f"/actions/{type}/{endpoint}?device={name}"
        response = requests.get(
            f"{TAPO_API}{action_url}",
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"[ACTION] Plug {'turned ON' if turn_on else 'turned OFF'} – Status: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Failed to switch plug: {e}")

def log_runtime_if_needed():
    global active_seconds, last_log_date
    today = date.today()
    if today != last_log_date:
        try:
            with open(LOG_FILE, "a", newline="") as f:
                writer = csv.writer(f)
                writer.writerow([last_log_date.isoformat(), active_seconds])
            print(f"[LOG] {last_log_date} – Logged {active_seconds} seconds ON")
        except Exception as e:
            print(f"[ERROR] Failed to write log: {e}")
        active_seconds = 0
        last_log_date = today

# === MAIN LOOP ===
def main():
    global active_seconds
    while True:
        if not is_within_active_hours(ACTIVE_HOURS_START, ACTIVE_HOURS_END):
            print(f"[SKIP] Outside of active time window ({ACTIVE_HOURS_START}:00–{ACTIVE_HOURS_END}:00).")
            log_runtime_if_needed()
            time.sleep(POLL_INTERVAL)
            continue

        print("[INFO] Within active time window – Checking status...")

        token = get_token()
        if not token:
            print("[FATAL] Could not retrieve token – skipping loop.")
            time.sleep(POLL_INTERVAL)
            continue

        power = get_power()
        if power is None:
            time.sleep(POLL_INTERVAL)
            continue
        print(f"[INFO] Feed-in value: {power} W")

        device_on = get_device_info(token, type=DEVICE_TYPE, name=DEVICE_NAME)
        if device_on is None:
            time.sleep(POLL_INTERVAL)
            continue

        print(f"[INFO] Feed-in: {power} W | Plug status: {'ON' if device_on else 'OFF'}")

        # Count runtime if active
        if device_on:
            active_seconds += POLL_INTERVAL

        # Hysteresis logic
        if not device_on and power <= POWER_ON_THRESHOLD:
            print("[INFO] Sufficient surplus – turning plug ON")
            switch_device(token, True, type=DEVICE_TYPE, name=DEVICE_NAME)
        elif device_on and power >= POWER_OFF_THRESHOLD:
            print("[INFO] Insufficient surplus – turning plug OFF")
            switch_device(token, False, type=DEVICE_TYPE, name=DEVICE_NAME)

        log_runtime_if_needed()
        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()
