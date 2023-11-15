-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

-- EXAMPLE:

-- Example for SellTrades
insert into "SellTrades" ("uniqueId", "symbol", "type", "qty")
values (1, 'BTCUSD', 'Market SELL', 0.00056);

-- Example for BuyTrades, using a valid uniqueId
insert into "BuyTrades" ("uniqueId", "symbol", "type", "qty")
values (1, 'BTCUSD', 'Market BUY', 0.00056);
