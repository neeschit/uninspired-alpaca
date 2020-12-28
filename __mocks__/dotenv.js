"use strict";
const dotenv = require("dotenv");

const mockConfig = () => {
    dotenv.config();
    process.env.ALPACA_SECRET_KEY_ID = "PKYCXXSMDJXMUBRKL2A7";
    process.env.ALPACA_SECRET_KEY = "PUrfzOZqpYrpzlG4Rzj2acTA8U4lfmE5TnKLajbM";
    process.env.LOGLEVEL = "1";

    return {
        parsed: {
            ALPACA_SECRET_KEY_ID: "PKYCXXSMDJXMUBRKL2A7",
            ALPACA_SECRET_KEY: "PUrfzOZqpYrpzlG4Rzj2acTA8U4lfmE5TnKLajbM",
            LOGLEVEL: "1",
        },
    };
};

const mock = jest.createMockFromModule("dotenv");

mock.config = mockConfig;

mock.parse = jest.fn();

module.exports = mock;
