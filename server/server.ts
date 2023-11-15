// server.ts
/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import { ClientError, errorMiddleware } from '../server/lib/index.js';

// Import Alpaca module
import Alpaca from '@alpacahq/alpaca-trade-api';

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT}/${process.env.RDS_DB_NAME}`;
const db = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

// Create paths for static directories
const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

app.use(express.static(reactStaticDir));
// Static directory for file uploads server/public/
app.use(express.static(uploadsStaticDir));
app.use(express.json());

// Alpaca API key and secret
const alpaca = new Alpaca({
  keyId: 'PKQ2BQ88YUJUY1720V1D',
  secretKey: 'edFVbuQiuDjdu2sCoIL1S4dAUDSips18cyXSpSLt',
  paper: true, // Set to 'false' for live trading
  usePolygon: false, // Set to 'true' to use Polygon data
});

// Endpoint to fetch Alpaca account information
app.get('/api/alpaca/account', async (req, res) => {
  try {
    const account = await alpaca.getAccount();
    res.json(account);
  } catch (error) {
    console.error('Error fetching Alpaca account information:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Trading strategy function
const runTradingStrategy = async () => {
  try {
    // Buy Bitcoin (BTC)
    const symbol = 'BTCUSD';
    const quantityToBuy = 0.00056; // Adjust the quantity as needed

    console.log('Placing buy order...');
    const buyOrder = await alpaca.createOrder({
      symbol,
      qty: quantityToBuy,
      side: 'buy',
      type: 'market',
      time_in_force: 'gtc',
    });

    console.log('Buy order placed:', buyOrder);

    // Wait for 30 seconds
    console.log('Waiting for 30 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // Sell Bitcoin (BTC) after 30 seconds
    console.log('Placing sell order...');
    const sellOrder = await alpaca.createOrder({
      symbol,
      qty: quantityToBuy,
      side: 'sell',
      type: 'market',
      time_in_force: 'gtc',
    });

    console.log('Sell order placed:', sellOrder);

    console.log('Trading strategy completed.');
  } catch (error) {
    console.error('Error executing trading strategy:', error);
  }
};

// Endpoint to trigger the trading strategy
app.get('/api/alpaca/run-trading-strategy', async (req, res) => {
  await runTradingStrategy(); // Wait for the trading strategy to complete
  res.json({ message: 'Trading strategy completed' });
});

// Endpoint to serve React's index.html if no API route matches
app.get('*', (req, res) => res.sendFile(`${reactStaticDir}/index.html`));

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
