import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  MenuItem,
  Button, 
  Box, 
  CircularProgress, 
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  Alert 
} from '@mui/material';
import StockChart from '../components/StockChart';
import { fetchStockData, getAvailableTickers } from '../services/api';

const timeIntervals = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' }
];

const StockPage = () => {
  const [ticker, setTicker] = useState('');
  const [minutes, setMinutes] = useState(60);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTickers] = useState(getAvailableTickers());

  const handleFetchData = async () => {
    if (!ticker) {
      setError('Please select a stock ticker');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await fetchStockData(ticker, minutes);
      setStockData(data);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(`Failed to fetch data for ${ticker}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when ticker or minutes change
  useEffect(() => {
    if (ticker) {
      handleFetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, minutes]);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Stock Price Analysis
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <Autocomplete
            id="ticker-select"
            options={availableTickers}
            value={ticker}
            onChange={(event, newValue) => setTicker(newValue)}
            sx={{ minWidth: 200 }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Stock Ticker" 
                variant="outlined" 
                fullWidth 
                placeholder="Select a ticker"
              />
            )}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="time-interval-label">Time Interval</InputLabel>
            <Select
              labelId="time-interval-label"
              id="time-interval-select"
              value={minutes}
              label="Time Interval"
              onChange={(e) => setMinutes(e.target.value)}
            >
              {timeIntervals.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button 
            variant="contained" 
            onClick={handleFetchData}
            disabled={loading || !ticker}
            sx={{ height: { sm: 56 }, alignSelf: { xs: 'stretch', sm: 'auto' } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Refresh Data'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && !stockData && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {stockData && (
          <StockChart 
            data={stockData.priceHistory} 
            averagePrice={stockData.averageStockPrice}
            ticker={ticker}
          />
        )}
      </Paper>
    </Container>
  );
};

export default StockPage;