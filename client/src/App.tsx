import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [accountInfo, setAccountInfo] = useState<any>(null);

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
        </div>
      ) : (
        <p>Loading account information...</p>
      )}
    </div>
  );
};

export default App;
