import React, { useEffect, useState } from "react";

const TasmotaLiveData: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:4000/tasmota");
      if (!response.ok) throw new Error("Fehler beim Abrufen der Daten");
      const result = await response.json();
      console.log(result);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Alle 5 Sekunden aktualisieren
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-gray-800 text-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold">⚡ Tasmota Live-Daten</h2>
      {error && <p className="text-red-400">❌ Fehler: {error}</p>}
      {!data ? (
        <p>⏳ Lade Daten...</p>
      ) : (
        <div className="mt-2">
          <p>
            🔢 Zählernummer:{" "}
            {data.StatusSNS?.Power?.Meter_Number || "Unbekannt"}
          </p>
          <p>⚡ Aktuelle Leistung: {data.StatusSNS?.Power?.Power_curr} W</p>
          <p>📊 Gesamtverbrauch: {data.StatusSNS?.Power?.Total_in} kWh</p>
          <p>🔋 Einspeisung: {data.StatusSNS?.Power?.Total_out} kWh</p>
        </div>
      )}
    </div>
  );
};

export default TasmotaLiveData;
