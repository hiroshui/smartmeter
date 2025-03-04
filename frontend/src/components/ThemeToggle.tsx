import React from "react";
import { IconButton } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useTheme } from "../ThemeProvider";

const ThemeToggle: React.FC = () => {
  const { toggleTheme } = useTheme();
  return (
    <IconButton onClick={toggleTheme} color="inherit">
      <Brightness4 />
    </IconButton>
  );
};

export default ThemeToggle;
