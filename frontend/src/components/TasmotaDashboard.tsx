/// <reference types="node" />

import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Grid,
  Card,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  useTheme,
} from "@mui/material";
import {
  Bolt,
  BatteryFull,
  Power,
  ElectricalServices,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import ThemeToggle from "./ThemeToggle";

const API_URL = "/api/tasmota";
const LOCAL_API_URL = "http://localhost:4000/tasmota";

const TasmotaDashboard: React.FC = () => {
  const theme = useTheme(); // Get current theme (light/dark)
  const isDarkMode = theme.palette.mode === "dark"; // Check if dark mode is active

  const [power, setPower] = useState<number>(0);
  const [totalIn, setTotalIn] = useState<number>(0);
  const [totalOut, setTotalOut] = useState<number>(0);
  const [meterNumber, setMeterNumber] = useState<string>("Unknown");
  const [history, setHistory] = useState<{ time: string; power: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshRate, setRefreshRate] = useState<number>(() => {
    return parseInt(localStorage.getItem("refreshRate") || "60000", 10);
  });

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateData = (result: any) => {
    setPower((prev) =>
      prev !== result?.StatusSNS?.Power?.Power_curr
        ? result?.StatusSNS?.Power?.Power_curr || 0
        : prev
    );
    setTotalIn((prev) =>
      prev !== result?.StatusSNS?.Power?.Total_in
        ? result?.StatusSNS?.Power?.Total_in || 0
        : prev
    );
    setTotalOut((prev) =>
      prev !== result?.StatusSNS?.Power?.Total_out
        ? result?.StatusSNS?.Power?.Total_out || 0
        : prev
    );
    setMeterNumber((prev) =>
      prev !== result?.StatusSNS?.Power?.Meter_Number
        ? result?.StatusSNS?.Power?.Meter_Number || "Unknown"
        : prev
    );

    const timestamp = new Date().toLocaleTimeString();
    setHistory((prev) => [
      ...prev.slice(-20),
      { time: timestamp, power: result?.StatusSNS?.Power?.Power_curr || 0 },
    ]);
    setError(null);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error fetching data from API.");
      const result = await response.json();
      updateData(result);
    } catch (err: any) {
      console.warn("Main API failed, trying local API...");
      try {
        const response = await fetch(LOCAL_API_URL);
        if (!response.ok)
          throw new Error("Error fetching data from local API.");
        const result = await response.json();
        updateData(result);
      } catch (err: any) {
        setError("Failed to load data from both APIs.");
      }
    }
  };

  useEffect(() => {
    fetchData();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchData, refreshRate);
    return () => clearInterval(intervalRef.current!);
  }, [refreshRate]);

  const handleRefreshRateChange = (event: any) => {
    const newRate = parseInt(event.target.value, 10);
    setRefreshRate(newRate);
    localStorage.setItem("refreshRate", newRate.toString());
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
      <Grid container justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold">
          ⚡ Smart Meter Dashboard
        </Typography>
        <ThemeToggle />
      </Grid>

      <Box sx={{ mt: 2, mb: 3 }}>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Refresh Interval</InputLabel>
          <Select
            value={refreshRate}
            onChange={handleRefreshRateChange}
            label="Refresh Interval"
          >
            <MenuItem value={1000}>1 Second</MenuItem>
            <MenuItem value={3000}>3 Seconds</MenuItem>
            <MenuItem value={5000}>5 Seconds</MenuItem>
            <MenuItem value={10000}>10 Seconds</MenuItem>
            <MenuItem value={60000}>1 Minute</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error ? (
        <Typography color="error" variant="h6" sx={{ mt: 4 }}>
          ❌ {error}
        </Typography>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={4}
                sx={{ p: 2, textAlign: "center", minHeight: 120 }}
              >
                <Power color="primary" sx={{ fontSize: 50, mb: 1 }} />
                <Typography variant="h6">Cur. Power Consumption</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {power} W
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={4}
                sx={{ p: 2, textAlign: "center", minHeight: 120 }}
              >
                <BatteryFull color="secondary" sx={{ fontSize: 50, mb: 1 }} />
                <Typography variant="h6">Total Usage</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {totalIn} kWh
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={4}
                sx={{ p: 2, textAlign: "center", minHeight: 120 }}
              >
                <Bolt color="error" sx={{ fontSize: 50, mb: 1 }} />
                <Typography variant="h6">Total Feed-in</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {totalOut} kWh
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={4}
                sx={{
                  p: 2,
                  textAlign: "center",
                  minHeight: 120,
                  wordBreak: "break-word",
                }}
              >
                <ElectricalServices
                  color="success"
                  sx={{ fontSize: 50, mb: 1 }}
                />
                <Typography variant="h6">Meter Number</Typography>
                <Typography variant="h5">{meterNumber}</Typography>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              📈 Live Power Consumption
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <XAxis dataKey="time" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="power"
                  stroke={isDarkMode ? "#FF5252" : "#82ca9d"}
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}
    </Container>
  );
};

export default TasmotaDashboard;
