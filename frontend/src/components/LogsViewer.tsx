import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";

const API_URL = "/api/logs"; // Proxy-API Endpoint
const LOCAL_API_URL = "http://localhost:4000/logs";

const LogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<{ errorLog: string[]; outLog: string[] }>({
    errorLog: [],
    outLog: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.warn("Main Log API failed, trying local log API...");
      try {
        const response = await fetch(LOCAL_API_URL);
        if (!response.ok)
          throw new Error("Error fetching data from local log API.");
        const data = await response.json();
        setLogs(data);
      } catch (err: any) {
        setLogs({
          errorLog: [],
          outLog: [],
        });
        console.log("Failed to load log data from both log APIs.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📝 System Logs
      </Typography>

      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        centered
      >
        <Tab label="Error Logs" />
        <Tab label="Output Logs" />
      </Tabs>

      <Paper
        elevation={3}
        sx={{
          p: 2,
          mt: 2,
          maxHeight: 400,
          overflowY: "auto",
          textAlign: "left",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : (
          logs[selectedTab === 0 ? "errorLog" : "outLog"].map((line, index) => (
            <Box
              key={index}
              sx={{
                fontFamily: "monospace",
                fontSize: "0.9rem",
                whiteSpace: "pre-wrap",
              }}
            >
              {line}
            </Box>
          ))
        )}
      </Paper>
    </Container>
  );
};

export default LogsViewer;
