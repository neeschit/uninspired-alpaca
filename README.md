# uninspired-alpaca

# What is this?

This is a real time bidding platform for the stock market

# Setup

-   https://docs.timescale.com/latest/getting-started/setup
-   Install node v12
-   npm i
-   Sign up for an alpaca paper account https://app.alpaca.markets/signup
-   rename `.env-example` to `.env`
-   create api key on your alpaca paper account
-   replace the appropriate entries in `.env` with the newly created keys
-   yarn createSchemas
-   yarn cacheData
-   yarn backtest

# scratch notes / gotchas

-   yarn test compiles on the fly, running both test and tsc -w will cause tests to run twice
