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
    res.status(500).json({ error: "Fehler beim Abrufen der Tasmota-Daten" });
  }
});

app.listen(4000, () => console.log("Proxy läuft auf http://localhost:4000"));
