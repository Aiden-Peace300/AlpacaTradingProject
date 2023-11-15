// App.tsx
import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [strategyInitiating, setStrategyInitiating] = useState(false);
  const [strategyCompleted, setStrategyCompleted] = useState(false);

  useEffect(() => {
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

    fetchAccountInfo();
  }, []);

  const handleRunTradingStrategy = async () => {
    try {
      setStrategyInitiating(true); // Update state when the strategy is initiating
      const response = await fetch('/api/alpaca/run-trading-strategy');
      const result = await response.json();
      console.log(result);
      setStrategyCompleted(true); // Update state when the strategy is completed
    } catch (error) {
      console.error('Error running trading strategy:', error);
    } finally {
      setStrategyInitiating(false); // Reset state regardless of success or error
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
    </div>
  );
};

export default App;
