import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FaBolt, FaBatteryFull, FaPlug, FaChartLine } from "react-icons/fa";

const TASMOTA_API = "https://tasmota.hiroshui.men/tasmota"; // Dein Proxy

const TasmotaDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<{ time: string; power: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(TASMOTA_API);
      if (!response.ok) throw new Error("Fehler beim Abrufen der Daten");
      const result = await response.json();

      const timestamp = new Date().toLocaleTimeString();
      const power = result.StatusSNS?.Power?.Power_curr || 0;
      setHistory((prev) => [...prev.slice(-20), { time: timestamp, power }]);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Alle 5 Sek. aktualisieren
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-bold mb-6">⚡ Stromzähler Dashboard</h1>

        {error && <p className="text-red-500 text-lg">❌ {error}</p>}

        {!data ? (
          <p className="text-xl">⏳ Lade Daten...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center">
              <FaPlug className="text-5xl text-yellow-400 mb-2" />
              <p className="text-lg font-semibold">Leistung</p>
              <p className="text-3xl font-bold">
                {data.StatusSNS?.Power?.Power_curr || 0} W
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center">
              <FaBatteryFull className="text-5xl text-green-400 mb-2" />
              <p className="text-lg font-semibold">Verbrauch</p>
              <p className="text-3xl font-bold">
                {data.StatusSNS?.Power?.Total_in || 0} kWh
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center">
              <FaBolt className="text-5xl text-blue-400 mb-2" />
              <p className="text-lg font-semibold">Einspeisung</p>
              <p className="text-3xl font-bold">
                {data.StatusSNS?.Power?.Total_out || 0} kWh
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center">
              <FaChartLine className="text-5xl text-red-400 mb-2" />
              <p className="text-lg font-semibold">Zählernummer</p>
              <p className="text-md font-bold">
                {data.StatusSNS?.Power?.Meter_Number || "Unbekannt"}
              </p>
            </div>
          </div>
        )}

        <div className="w-full mt-6">
          <h2 className="text-xl font-bold mb-2">📈 Leistungsentwicklung</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <XAxis dataKey="time" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="power"
                stroke="#82ca9d"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TasmotaDashboard;
