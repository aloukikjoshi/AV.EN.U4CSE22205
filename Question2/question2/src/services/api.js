import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // This should match your backend URL from Question1

// Fetch stock data for a single ticker
export const fetchStockData = async (ticker, minutes = 60) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stocks/${ticker}`, {
      params: {
        minutes,
        aggregation: 'average'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

// Fetch stock correlation data
export const fetchCorrelationData = async (tickers, minutes = 60) => {
  try {
    const params = new URLSearchParams();
    params.append('minutes', minutes);
    
    // Add each ticker as a separate query parameter
    tickers.forEach(ticker => params.append('ticker', ticker));
    
    const response = await axios.get(`${API_BASE_URL}/stockcorrelation`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching correlation data:', error);
    throw error;
  }
};

// Fetch available tickers (for demo purposes, in a real app this might come from the API)
export const getAvailableTickers = () => {
  return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NFLX', 'IBM'];
};
