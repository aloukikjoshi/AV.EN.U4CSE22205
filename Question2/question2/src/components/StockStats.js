import React from 'react';
import { Paper, Typography, Box, Divider, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EqualizerIcon from '@mui/icons-material/Equalizer';

const StockStats = ({ stockData }) => {
  if (!stockData) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Hover over tickers in the heatmap to view stock statistics
        </Typography>
      </Paper>
    );
  }

  const { ticker, averagePrice, priceHistory, stdDev } = stockData;

  const latestPrice = priceHistory && priceHistory.length > 0 ? 
    parseFloat(priceHistory[priceHistory.length - 1].price) : 0;
  
  const oldestPrice = priceHistory && priceHistory.length > 0 ? 
    parseFloat(priceHistory[0].price) : 0;
  
  const priceChange = latestPrice - oldestPrice;
  const percentChange = oldestPrice !== 0 ? (priceChange / oldestPrice) * 100 : 0;
  
  const isPositiveChange = priceChange >= 0;

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="h3">
          {ticker} Statistics
        </Typography>
        <EqualizerIcon color="primary" />
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Average Price</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ${averagePrice.toFixed(2)}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Standard Deviation</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ${stdDev.toFixed(2)}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Latest Price</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ${latestPrice.toFixed(2)}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">Price Change</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isPositiveChange ? 
              <TrendingUpIcon color="success" sx={{ mr: 1 }} /> : 
              <TrendingDownIcon color="error" sx={{ mr: 1 }} />
            }
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: isPositiveChange ? 'success.main' : 'error.main'
              }}
            >
              {isPositiveChange ? '+' : ''}{priceChange.toFixed(2)} ({isPositiveChange ? '+' : ''}{percentChange.toFixed(2)}%)
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">Data Points</Typography>
          <Typography variant="body1">
            {priceHistory ? priceHistory.length : 0}
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Volatility Index
          </Typography>
          <Box 
            sx={{ 
              mt: 1,
              height: '10px', 
              width: '100%', 
              backgroundColor: '#e0e0e0',
              borderRadius: 5
            }}
          >
            <Box 
              sx={{ 
                height: '100%', 
                width: `${Math.min((stdDev / averagePrice) * 300, 100)}%`, 
                backgroundColor: (stdDev / averagePrice) > 0.05 ? 'error.main' : 'success.main',
                borderRadius: 5,
                transition: 'width 0.5s'
              }} 
            />
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            Volatility: {((stdDev / averagePrice) * 100).toFixed(2)}% of average price
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StockStats;
