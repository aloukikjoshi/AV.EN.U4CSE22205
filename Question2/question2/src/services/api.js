import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

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

export const fetchCorrelationData = async (tickers, minutes = 60) => {
  try {
    const params = new URLSearchParams();
    params.append('minutes', minutes);
    
    tickers.forEach(ticker => params.append('ticker', ticker));
    
    const response = await axios.get(`${API_BASE_URL}/stockcorrelation`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching correlation data:', error);
    throw error;
  }
};

// Sample tickers for demo
export const getAvailableTickers = () => {
  return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NFLX', 'IBM'];
};
