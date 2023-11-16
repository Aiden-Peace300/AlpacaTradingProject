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
const runTradingStrategy = async (): Promise<void> => {
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

// Endpoint to fetch BuyTable data
app.get('/api/buy-trades', async (req, res) => {
  try {
    const buyTradesData = await fetchBuyTradesFromDatabase();
    res.json(buyTradesData);
  } catch (error) {
    console.error('Error fetching BuyTable data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// function to fetch data for BuyTrades from the database
const fetchBuyTradesFromDatabase = async (): Promise<any[]> => {
  try {
    const buyTradesQuery = 'SELECT * FROM "BuyTrades"';
    const buyTradesResult = await db.query(buyTradesQuery);
    return buyTradesResult.rows;
  } catch (error) {
    throw new Error(`Error fetching BuyTable data from the database: ${error}`);
  }
};

app.get('/api/sell-trades', async (req, res) => {
  try {
    const sellTradesData = await fetchSellTradesFromDatabase();
    res.json(sellTradesData);
  } catch (error) {
    console.error('Error fetching SellTable data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// function to fetch data for SellTrades from the database
const fetchSellTradesFromDatabase = async (): Promise<any[]> => {
  try {
    const sellTradesQuery = 'SELECT * FROM "SellTrades"';
    const sellTradesResult = await db.query(sellTradesQuery);
    return sellTradesResult.rows;
  } catch (error) {
    throw new Error(
      `Error fetching SellTable data from the database: ${error}`
    );
  }
};

/**
 * A catch-all route to serve the React application's index.html.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
app.get('*', (req, res) => res.sendFile(`${reactStaticDir}/index.html`));

/**
 * Error handling middleware.
 * @param {Error} err - The error object.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 */
app.use(errorMiddleware);

// Start the server
app.listen(process.env.PORT, () => {
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
