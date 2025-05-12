import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import StockStats from '../components/StockStats';
import { fetchCorrelationData, getAvailableTickers } from '../services/api';

const timeIntervals = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' }
];

function HeatmapPage() {
  const availableTickers = getAvailableTickers();
  
  const [minutes, setMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [correlationMatrix, setCorrelationMatrix] = useState([]);
  const [stocksData, setStocksData] = useState({});
  const [selectedStock1, setSelectedStock1] = useState(null);
  const [selectedStock2, setSelectedStock2] = useState(null);
  const [stockStats, setStockStats] = useState(null);
  const [selectedTickers, setSelectedTickers] = useState(availableTickers.slice(0, 5));

  // Standard deviation
  const calculateStdDev = (prices, avg) => {
    if (!prices || prices.length === 0) return 0;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length;
    return Math.sqrt(variance);
  };

  // Handle function for ticker hover in heatmap
  const handleTickerHover = (ticker1, ticker2) => {
    if (ticker1) {
      const stockData = stocksData[ticker1];
      if (stockData) {
        const prices = stockData.priceHistory.map(item => parseFloat(item.price));
        const avg = stockData.averagePrice;
        const stdDev = calculateStdDev(prices, avg);
        
        setStockStats({
          ticker: ticker1,
          averagePrice: avg,
          priceHistory: stockData.priceHistory,
          stdDev: stdDev
        });
      }
    } else {
      setStockStats(null);
    }

    setSelectedStock1(ticker1);
    setSelectedStock2(ticker2);
  };

  // Fetching correlations function
  const fetchAllCorrelations = async () => {
    if (selectedTickers.length < 2) {
      setError('Please select at least 2 tickers');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const matrix = Array(selectedTickers.length).fill().map(() => Array(selectedTickers.length).fill(0));
      const stocksDataObj = {};
      for (let i = 0; i < selectedTickers.length; i++) {
        for (let j = i; j < selectedTickers.length; j++) {
          if (i === j) {
            // A stock perfectly correlates with itself
            matrix[i][j] = 1.0;
          } else {
            // Fetch correlation between both the stocks
            const pair = [selectedTickers[i], selectedTickers[j]];
            const data = await fetchCorrelationData(pair, minutes);
            
            matrix[i][j] = data.correlation;
            matrix[j][i] = data.correlation; // Correlation matrix is symmetric in nature
            
            // Store stock data
            stocksDataObj[pair[0]] = data.stocks[pair[0]];
            stocksDataObj[pair[1]] = data.stocks[pair[1]];
          }
        }
      }
      
      setCorrelationMatrix(matrix);
      setStocksData(stocksDataObj);
      
    } catch (err) {
      console.error('Error fetching correlations:', err);
      setError('Failed to fetch correlation data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial load and when parameters change
  useEffect(() => {
    if (selectedTickers.length >= 2) {
      fetchAllCorrelations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes, selectedTickers.join(',')]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Stock Correlation Heatmap
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <FormControl fullWidth sx={{ maxWidth: { sm: 300 } }}>
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

          <FormControl fullWidth>
            <InputLabel id="tickers-select-label">Selected Tickers</InputLabel>
            <Select
              labelId="tickers-select-label"
              id="tickers-select"
              multiple
              value={selectedTickers}
              onChange={(e) => setSelectedTickers(e.target.value)}
              label="Selected Tickers"
              renderValue={(selected) => selected.join(', ')}
            >
              {availableTickers.map((ticker) => (
                <MenuItem key={ticker} value={ticker}>
                  {ticker}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button 
            variant="contained" 
            onClick={fetchAllCorrelations}
            disabled={loading || selectedTickers.length < 2}
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

        {loading && !correlationMatrix.length && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {selectedTickers.length < 2 && !loading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please select at least 2 tickers to view correlation data
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {correlationMatrix.length > 0 && (
              <CorrelationHeatmap 
                correlationsData={correlationMatrix}
                tickers={selectedTickers}
                onTickerHover={handleTickerHover}
              />
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <StockStats stockData={stockStats} />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default HeatmapPage;
