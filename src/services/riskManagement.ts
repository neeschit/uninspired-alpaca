import { roundHalf, ceilHalf, floorHalf } from "../util";

export const TRADING_RISK_UNIT_CONSTANT = 100;

export const assessRisk = (
    dailyAtr: number,
    currentIntradayAtr: number,
    currentPrice: number
): number => {
    const minStop = Number((dailyAtr / 8).toFixed(2));

    const proposedStopUnits = Math.max(minStop, currentIntradayAtr, 0.3);

    if (currentPrice > 500) {
        return Math.max(proposedStopUnits, 4);
    } else if (currentPrice > 350) {
        return Math.max(proposedStopUnits, 2);
    } else if (currentPrice > 150) {
        return Math.max(proposedStopUnits, 1);
    } else if (currentPrice > 80) {
        return Math.max(proposedStopUnits, 0.5);
    }

    return proposedStopUnits;
};

export const getActualStop = (
    price: number,
    intradayAtr: number,
    isShort: boolean,
    dailyAtr: number
): number => {
    const stopUnits = assessRisk(dailyAtr, intradayAtr, price);
    const allowedLeeway = dailyAtr / 100;
    const stopPrice = isShort ? price + stopUnits : price - stopUnits;

    const roundedPrice = isShort
        ? ceilHalf(stopPrice) + allowedLeeway
        : floorHalf(stopPrice) - allowedLeeway;

    const diff = Math.abs(roundedPrice - stopPrice);

    if (diff > allowedLeeway * 4) {
        return stopPrice;
    }

    if (Math.abs(price - roundedPrice) > 2 * intradayAtr && price > 500) {
        return isShort
            ? roundHalf(roundedPrice - intradayAtr)
            : roundHalf(roundedPrice + intradayAtr);
    }

    return Number(roundedPrice.toFixed(2));
};
