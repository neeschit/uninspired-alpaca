import * as dotenv from "dotenv";

dotenv.config();

export enum LogLevel {
    ERROR = 1,
    INFO = 2,
    WARN = 3,
    DEBUG = 4,
    TRACE = 5,
}

const CONFIGURED_LOG_LEVEL = process.env.LOGLEVEL || LogLevel.WARN;

export const LOGGER = {
    info: CONFIGURED_LOG_LEVEL > 1 ? console.log.bind(console) : () => {},
    error: console.error.bind(console),
    warn: CONFIGURED_LOG_LEVEL > 2 ? console.warn.bind(console) : () => {},
    debug: CONFIGURED_LOG_LEVEL > 3 ? console.debug.bind(console) : () => {},
    trace: CONFIGURED_LOG_LEVEL > 4 ? console.log.bind(console) : () => {},
};

process.on("uncaughtException", function (err) {
    LOGGER.error("Uncaught exception raised : ", err);
    LOGGER.error(err.stack);
});
