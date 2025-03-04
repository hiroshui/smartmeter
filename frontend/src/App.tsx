import React from "react";
import { CustomThemeProvider } from "./ThemeProvider";
import TasmotaDashboard from "./components/TasmotaDashboard";

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <TasmotaDashboard />
    </CustomThemeProvider>
  );
};

export default App;
