export const backtest = () => {
    if (process.env.length) {
        return true;
    }

    return false;
};
