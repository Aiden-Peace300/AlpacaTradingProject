// App.tsx
import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [strategyInitiating, setStrategyInitiating] = useState(false);
  const [strategyCompleted, setStrategyCompleted] = useState(false);

  const fetchAccountInfo = async () => {
    try {
      const response = await fetch('/api/alpaca/account');
      const account = await response.json();
      console.log(account);
      setAccountInfo(account);
    } catch (error) {
      console.error('Error fetching account information:', error);
    }
  };

  useEffect(() => {
    fetchAccountInfo(); // Initial fetch

    // Fetch account info every 10 seconds (adjust the interval as needed)
    const intervalId = setInterval(fetchAccountInfo, 10000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [strategyCompleted]); // Trigger the effect when strategyCompleted changes

  const handleRunTradingStrategy = async () => {
    try {
      setStrategyInitiating(true);
      const response = await fetch('/api/alpaca/run-trading-strategy');
      const result = await response.json();
      console.log(result);
      setStrategyCompleted(true);
    } catch (error) {
      console.error('Error running trading strategy:', error);
    } finally {
      setStrategyInitiating(false);
    }
  };

  return (
    <div>
      <h1>Alpaca Account Information</h1>
      {accountInfo ? (
        <div>
          <p>Account ID: {accountInfo.id}</p>
          <p>Cash Power: ${accountInfo.cash}</p>
          <p>Buying Power: ${accountInfo.buying_power}</p>
          <p>Daily Change: ${accountInfo.portfolio_value}</p>
          {accountInfo.trading_blocked && (
            <p>Account is currently restricted from trading.</p>
          )}
          <button
            onClick={handleRunTradingStrategy}
            disabled={strategyInitiating}>
            {strategyInitiating
              ? 'Initiating Trading Strategy...'
              : strategyCompleted
              ? 'Trading strategy completed!'
              : 'Run Trading Strategy'}
          </button>
        </div>
      ) : (
        <p>Loading account information...</p>
      )}
      <h1>Trades for DATE HERE</h1>
    </div>
  );
};

export default App;
