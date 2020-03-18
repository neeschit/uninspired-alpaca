import * as dotenv from "dotenv";

const config = dotenv.config().parsed;

export enum LogLevel {
    ERROR = 1,
    INFO = 2,
    WARN = 3,
    DEBUG = 4,
    TRACE = 5
}

const CONFIGURED_LOG_LEVEL = (config && config.LOGLEVEL) || process.env.LOGLEVEL || LogLevel.WARN;

const checkBeforeLog = (
    logLevel: LogLevel,
    logKey: "log" | "warn" | "error" | "debug",
    message?: any,
    ...optionalParams: any[]
) => {
    if (logLevel > CONFIGURED_LOG_LEVEL) {
        return;
    }

    console[logKey].apply(console, [message, ...optionalParams]);
};

export const LOGGER = {
    info: (message: any, ...optionalParams: any[]) => {
        checkBeforeLog(LogLevel.INFO, "log", message, ...optionalParams);
    },
    error: (message: any, ...optionalParams: any[]) => {
        checkBeforeLog(LogLevel.ERROR, "error", message, ...optionalParams);
    },
    warn: (message: any, ...optionalParams: any[]) => {
        checkBeforeLog(LogLevel.WARN, "warn", message, ...optionalParams);
    },
    debug: (message: any, ...optionalParams: any[]) => {
        checkBeforeLog(LogLevel.DEBUG, "debug", message, ...optionalParams);
    },
    trace: (message: any, ...optionalParams: any[]) => {
        checkBeforeLog(LogLevel.TRACE, "debug", message, ...optionalParams);
    }
};

process.on("uncaughtException", function(err) {
    console.error("Uncaught exception raised : ", err);
});
