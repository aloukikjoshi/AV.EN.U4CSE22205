const express = require('express');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
// Base URL of the evaluation test server
const TEST_SERVER_BASE = 'http://20.244.56.144/evaluation-service';

// Utility: fetch JSON from test server
function fetchJSON(path) {
  const url = TEST_SERVER_BASE + path;
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Endpoint: Average Stock Price
// GET /stocks/:ticker?minutes=<m>&aggregation=average
app.get('/stocks/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const minutes = parseInt(req.query.minutes) || 60;
  const agg = (req.query.aggregation || '').toLowerCase();
  if (agg !== 'average') {
    return res.status(400).json({ error: 'Unsupported aggregation' });
  }

  try {
    // Fetch price history
    const history = await fetchJSON(`/prices/${ticker}?minutes=${minutes}`);
    // Compute average manually
    const prices = history.map(e => parseFloat(e.price));
    const avg = prices.length
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : 0;

    return res.json({
      averageStockPrice: avg,
      priceHistory: history
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Helper: statistics functions
function mean(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}
function covariance(x, y) {
  const n = x.length;
  const mX = mean(x), mY = mean(y);
  let cov = 0;
  for (let i = 0; i < n; i++) cov += (x[i] - mX) * (y[i] - mY);
  return cov / (n - 1);
}
function stdDev(arr) {
  const m = mean(arr);
  const sumSq = arr.reduce((sum, v) => sum + Math.pow(v - m, 2), 0);
  return Math.sqrt(sumSq / (arr.length - 1));
}
function correlation(x, y) {
  return covariance(x, y) / (stdDev(x) * stdDev(y));
}

// Endpoint: Correlation between two stocks
// GET /stockcorrelation?minutes=<m>&ticker=AAA&ticker=BBB
app.get('/stockcorrelation', async (req, res) => {
  const minutes = parseInt(req.query.minutes) || 60;
  let tickers = req.query.ticker;
  if (!tickers || tickers.length !== 2) {
    return res.status(400).json({ error: 'Provide exactly two tickers as ?ticker=AAA&ticker=BBB' });
  }
  try {
    // Fetch both histories in parallel
    const [hist1, hist2] = await Promise.all(
      tickers.map(t => fetchJSON(`/prices/${t}?minutes=${minutes}`))
    );
    // Align by index (simple alignment)
    const n = Math.min(hist1.length, hist2.length);
    const p1 = hist1.slice(0, n).map(e => parseFloat(e.price));
    const p2 = hist2.slice(0, n).map(e => parseFloat(e.price));
    const corr = n > 1 ? correlation(p1, p2) : 0;

    // Prepare response
    const obj = {
      correlation: corr,
      stocks: {}
    };
    obj.stocks[tickers[0]] = {
      averagePrice: mean(p1),
      priceHistory: hist1
    };
    obj.stocks[tickers[1]] = {
      averagePrice: mean(p2),
      priceHistory: hist2
    };

    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
