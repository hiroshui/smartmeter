const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());


const ERR_LOG = "/home/smartmeter/.pm2/logs/tasmota-proxy-error.log";
const OUT_LOG = "/home/smartmeter/.pm2/logs/tasmota-proxy-out.log";

const TASMOTA_IP = "http://power.meter"; // Ersetze mit deiner echten Tasmota-IP

app.get("/tasmota", async (req, res) => {
  try {
    var time = new Date().toLocaleString();
    const response = await fetch(`${TASMOTA_IP}/cm?cmnd=Status%2010`);
    const data = await response.json();
    console.log(time + " - successfully requested data from tasmota.");
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error while fetching data from " + TASMOTA_IP });
  }
});


app.get("/logs", async (req, res) => {
  try {
    const errLogExists = fs.existsSync(ERR_LOG);
    const outLogExists = fs.existsSync(OUT_LOG);

    if (!errLogExists || !outLogExists) {
      return res.status(404).json({ error: "Log file(s) not found" });
    }

    const errLog = fs.readFileSync(ERR_LOG, "utf8");
    const outLog = fs.readFileSync(OUT_LOG, "utf8");

    res.json({
      errorLog: errLog.split("\n").slice(-50), // Nur die letzten 50 Zeilen zurückgeben
      outLog: outLog.split("\n").slice(-50),
    });
  } catch (error) {
    console.error("Error reading log files:", error);
    res.status(500).json({ error: "Failed to read logs" });
  }
});


app.listen(4000, '0.0.0.0', () => console.log("Proxy runs on port 4000."));
