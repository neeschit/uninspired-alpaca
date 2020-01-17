const Alpaca = require("@alpacahq/alpaca-trade-api");
const dotenv = require("dotenv");

const config = dotenv.config().parsed;

const alpaca = new Alpaca({
    keyId: config.ALPACA_SECRET_KEY_ID,
    secretKey: config.ALPACA_SECRET_KEY,
    paper: true
});

module.exports = {
    alpaca
};
