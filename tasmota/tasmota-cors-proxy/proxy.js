const express = require("express");
const cors = require("cors");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());

const TASMOTA_IP = "http://power.meter"; // Ersetze mit deiner echten Tasmota-IP

app.get("/tasmota", async (req, res) => {
  try {
    const response = await fetch(`${TASMOTA_IP}/cm?cmnd=Status%2010`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error while fetching data from " + TASMOTA_IP });
  }
});

app.listen(4000, '0.0.0.0', () => console.log("Proxy runs on port 4000."));
