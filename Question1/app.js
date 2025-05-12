// Load environment variables from .env
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
// Enable CORS for frontend requests
app.use(cors());
const PORT = process.env.PORT || 5000;

// Base host and token for the evaluation test server
const TEST_SERVER_HOST = '20.244.56.144';
const AUTH_TOKEN = process.env.AUTH_TOKEN;
if (!AUTH_TOKEN) {
  console.error('AUTH_TOKEN not set. Please add your token to .env');
  process.exit(1);
}

/**
 * GET JSON from the test server, using Bearer auth
 * @param {string} path - Full path including /evaluation-service prefix and query
 * @returns {Promise<any>} Parsed JSON
 */
function fetchJSON(path) {
  const options = {
    hostname: TEST_SERVER_HOST,
    path,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Accept': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => raw += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(raw.trim());
          resolve(json);
        } catch (err) {
          console.error('FetchJSON parse error:', raw);
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}
// Average Stock Price endpoint
// GET /stocks/:ticker?minutes=<m>&aggregation=average
app.get('/stocks/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const minutes = parseInt(req.query.minutes, 10) || 60;
  const agg = (req.query.aggregation || '').toLowerCase();
  if (agg !== 'average') {
    return res.status(400).json({ error: 'Only average aggregation supported' });
  }

  try {
    // Fetch price history from test server
    // Correct path: /evaluation-service/stocks/:ticker?minutes=<m>
    const history = await fetchJSON(`/evaluation-service/stocks/${ticker}?minutes=${minutes}`);

    if (!Array.isArray(history)) {
      console.error('Unexpected history format:', history);
      return res.status(500).json({ error: 'Invalid data from test server' });
    }

    // Compute average
    const prices = history.map(e => parseFloat(e.price));
    const average = prices.length
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : 0;

    res.json({ averageStockPrice: average, priceHistory: history });
  } catch (err) {
    console.error('/stocks error:', err);
    res.status(500).json({ error: 'Unable to fetch stock prices' });
  }
});
// Stock Correlation endpoint
// GET /stockcorrelation?minutes=<m>&ticker=AAA&ticker=BBB

function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
function covariance(x, y) {
  const mX = mean(x), mY = mean(y);
  return x.map((v, i) => (v - mX) * (y[i] - mY)).reduce((a, b) => a + b, 0) / (x.length - 1);
}
function stdDev(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.map(v => (v - m) ** 2).reduce((a, b) => a + b, 0) / (arr.length - 1));
}
function correlation(x, y) {
  const cov = covariance(x, y);
  const sx = stdDev(x), sy = stdDev(y);
  return sx && sy ? cov / (sx * sy) : 0;
}

app.get('/stockcorrelation', async (req, res) => {
  const minutes = parseInt(req.query.minutes, 10) || 60;
  const tickers = req.query.ticker;
  if (!Array.isArray(tickers) || tickers.length !== 2) {
    return res.status(400).json({ error: 'Provide exactly two tickers' });
  }

  try {
    // Fetch price histories in parallel
    const [histA, histB] = await Promise.all([
      fetchJSON(`/evaluation-service/stocks/${tickers[0]}?minutes=${minutes}`),
      fetchJSON(`/evaluation-service/stocks/${tickers[1]}?minutes=${minutes}`)
    ]);

    if (!Array.isArray(histA) || !Array.isArray(histB)) {
      console.error('Invalid history formats:', histA, histB);
      return res.status(500).json({ error: 'Invalid data from test server' });
    }

    // Align and compute correlation
    const count = Math.min(histA.length, histB.length);
    const pricesA = histA.slice(0, count).map(e => parseFloat(e.price));
    const pricesB = histB.slice(0, count).map(e => parseFloat(e.price));
    const corrVal = correlation(pricesA, pricesB);

    res.json({
      correlation: corrVal,
      stocks: {
        [tickers[0]]: { averagePrice: mean(pricesA), priceHistory: histA },
        [tickers[1]]: { averagePrice: mean(pricesB), priceHistory: histB }
      }
    });
  } catch (err) {
    console.error('/stockcorrelation error:', err);
    res.status(500).json({ error: 'Unable to fetch correlation data' });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
