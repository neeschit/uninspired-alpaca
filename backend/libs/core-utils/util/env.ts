export const isBacktestingEnv = () => process.env.NODE_ENV === "backtest";
export const isTestingEnv = () =>
    isBacktestingEnv() || process.env.NODE_ENV === "test";
