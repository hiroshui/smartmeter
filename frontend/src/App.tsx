import React, { useState } from "react";
import { CustomThemeProvider } from "./ThemeProvider";
import TasmotaDashboard from "./components/TasmotaDashboard";
import LogsViewer from "./components/LogsViewer";
import { Box, IconButton, AppBar, Toolbar, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ThemeToggle from "./components/ThemeToggle";

const App: React.FC = () => {
  const [showLogs, setShowLogs] = useState(false);

  const toggleLogs = () => {
    setShowLogs((prev) => !prev);
  };

  return (
    <CustomThemeProvider>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ⚡ Smart Meter Dashboard
          </Typography>
          <IconButton color="inherit" onClick={toggleLogs}>
            {showLogs ? <Visibility /> : <VisibilityOff />}
          </IconButton>
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      <TasmotaDashboard />

      {showLogs && (
        <Box sx={{ mt: 6 }}>
          <LogsViewer />
        </Box>
      )}
    </CustomThemeProvider>
  );
};

export default App;
