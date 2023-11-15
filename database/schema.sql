set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

CREATE TABLE "BuyTrades" (
  "uniqueId" serial PRIMARY KEY,
  "symbol" text,
  "type" text,
  "qty" decimal,
  "createdAt" timestamptz
);

CREATE TABLE "SellTrades" (
  "uniqueId" serial PRIMARY KEY,
  "symbol" text,
  "type" text,
  "qty" decimal,
  "createdAt" timestamptz
);

ALTER TABLE "BuyTrades" ADD FOREIGN KEY ("uniqueId") REFERENCES "SellTrades" ("uniqueId");
