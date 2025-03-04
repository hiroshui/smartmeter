import React, { useState, useEffect } from "react";
import { Card, Typography, TextField, Grid, CardContent } from "@mui/material";
import { Euro } from "@mui/icons-material";

interface CostCalculatorProps {
  power: number;
  refreshRate: number;
}

const CostCalculator: React.FC<CostCalculatorProps> = ({
  power,
  refreshRate,
}) => {
  const [electricityPrice, setElectricityPrice] = useState<number>(() => {
    return parseFloat(localStorage.getItem("electricityPrice") || "0.30");
  });

  const [feedInPrice, setFeedInPrice] = useState<number>(() => {
    return parseFloat(localStorage.getItem("feedInPrice") || "0.00");
  });

  const [costPerInterval, setCostPerInterval] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [earningsPerInterval, setEarningsPerInterval] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);

  useEffect(() => {
    const intervalInHours = refreshRate / (1000 * 3600);

    // Berechnung der verbrauchten und eingespeisten Leistung
    const consumedPower = power > 0 ? power : 0;
    const generatedPower = power < 0 ? Math.abs(power) : 0;

    // Kostenberechnung
    const newCost = (consumedPower / 1000) * electricityPrice * intervalInHours;
    setCostPerInterval(newCost);
    setTotalCost((prev) => prev + newCost);

    // Einnahmenberechnung
    const newEarnings = (generatedPower / 1000) * feedInPrice * intervalInHours;
    setEarningsPerInterval(newEarnings);
    setTotalEarnings((prev) => prev + newEarnings);
  }, [power, refreshRate, electricityPrice, feedInPrice]);

  const handleElectricityPriceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPrice = parseFloat(event.target.value);
    setElectricityPrice(newPrice);
    localStorage.setItem("electricityPrice", newPrice.toString());
  };

  const handleFeedInPriceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPrice = parseFloat(event.target.value);
    setFeedInPrice(newPrice);
    localStorage.setItem("feedInPrice", newPrice.toString());
  };

  return (
    <Grid container spacing={3}>
      {/* Electricity price input */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="Electricity Price (€/kWh)"
          type="number"
          variant="outlined"
          value={electricityPrice}
          onChange={handleElectricityPriceChange}
          sx={{ width: "100%" }}
          inputProps={{ step: "0.0001", min: "0" }}
        />
      </Grid>

      {/* Feed-in price input */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="Feed-In Tariff (€/kWh)"
          type="number"
          variant="outlined"
          value={feedInPrice}
          onChange={handleFeedInPriceChange}
          sx={{ width: "100%" }}
          inputProps={{ step: "0.0001", min: "0" }}
        />
      </Grid>

      {/* Cost per interval */}
      <Grid item xs={12} sm={6}>
        <Card elevation={4} sx={{ p: 2, textAlign: "center", minHeight: 120 }}>
          <CardContent>
            <Euro color="primary" sx={{ fontSize: 50, mb: 1 }} />
            <Typography variant="h6">
              Cost per Interval ({refreshRate / 1000} secs)
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              €{costPerInterval.toFixed(6)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Earnings per interval */}
      <Grid item xs={12} sm={6}>
        <Card elevation={4} sx={{ p: 2, textAlign: "center", minHeight: 120 }}>
          <CardContent>
            <Euro color="success" sx={{ fontSize: 50, mb: 1 }} />
            <Typography variant="h6">
              Earnings per Interval ({refreshRate / 1000} secs)
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              €{earningsPerInterval.toFixed(6)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Total cost since launch */}
      <Grid item xs={12} sm={6}>
        <Card elevation={4} sx={{ p: 2, textAlign: "center", minHeight: 120 }}>
          <CardContent>
            {" "}
            <Euro color="secondary" sx={{ fontSize: 50, mb: 1 }} />
            <Typography variant="h6">Total Cost since Launch</Typography>
            <Typography variant="h4" fontWeight="bold">
              €{totalCost.toFixed(4)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Total feed-in earnings */}
      <Grid item xs={12} sm={6}>
        <Card elevation={4} sx={{ p: 2, textAlign: "center", minHeight: 120 }}>
          <CardContent>
            <Euro color="success" sx={{ fontSize: 50, mb: 1 }} />
            <Typography variant="h6">Total Feed-In Earnings</Typography>
            <Typography variant="h4" fontWeight="bold">
              €{totalEarnings.toFixed(4)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CostCalculator;
