import React from 'react';
import {
  Typography,
  Box,
  Paper,
} from '@mui/material';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const StockChart = ({ data, averagePrice, ticker }) => {
  if (!data || data.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No data available</Typography>
      </Paper>
    );
  }

  // Format timestamp and parse price values
  const formattedData = data.map(item => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString(),
    price: parseFloat(item.price)
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="subtitle2" color="primary">
            {ticker}
          </Typography>
          <Typography variant="body2">
            Price: ${payload[0].value.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Time: {payload[0].payload.time}
          </Typography>
          {averagePrice && (
            <Typography variant="body2" color="error">
              Deviation from average: {((payload[0].value - averagePrice) / averagePrice * 100).toFixed(2)}%
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };
  
  // Add small buffer to y-axis range
  const minPrice = Math.min(...formattedData.map(item => item.price)) * 0.995;
  const maxPrice = Math.max(...formattedData.map(item => item.price)) * 1.005;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {ticker} Stock Price Chart
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Average Price: <strong>${averagePrice ? averagePrice.toFixed(2) : 'N/A'}</strong>
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2 }}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time', position: 'insideBottomRight', offset: 0 }}
            />
            <YAxis 
              label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} 
              domain={[minPrice, maxPrice]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {averagePrice && (
              <ReferenceLine 
                y={averagePrice} 
                stroke="red" 
                strokeDasharray="3 3" 
                label={{ 
                  value: `Avg: $${averagePrice.toFixed(2)}`, 
                  position: 'right',
                  fill: 'red' 
                }} 
              />
            )}
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#1976d2" 
              activeDot={{ r: 8 }} 
              name={`${ticker} Price`}
              dot={{ stroke: '#1976d2', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default StockChart;