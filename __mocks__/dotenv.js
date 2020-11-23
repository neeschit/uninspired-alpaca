"use strict";
const dotenv = require("dotenv");

const mockConfig = () => {
    dotenv.config();
    process.env.ALPACA_SECRET_KEY_ID = "PKYCXXSMDJXMUBRKL2A7";
    process.env.ALPACA_SECRET_KEY = "PUrfzOZqpYrpzlG4Rzj2acTA8U4lfmE5TnKLajbM";
    process.env.LIVE_SECRET_KEY_ID = "PKYCXXSMDJXMUBRKL2A7";
    process.env.LOGLEVEL = "4";

    return {
        parsed: {
            ALPACA_SECRET_KEY_ID: "PKYCXXSMDJXMUBRKL2A7",
            ALPACA_SECRET_KEY: "PUrfzOZqpYrpzlG4Rzj2acTA8U4lfmE5TnKLajbM",
            LIVE_SECRET_KEY_ID: "PKYCXXSMDJXMUBRKL2A7",
            LOGLEVEL: "4",
        },
    };
};

const mock = jest.createMockFromModule("dotenv");

mock.config = mockConfig;

mock.parse = jest.fn();

module.exports = mock;
