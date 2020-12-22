import { Calendar } from "@neeschit/alpaca-trade-api";
import { getApiServer, Service } from "../../src/util/api";
import { enterSymbol, rebalanceForSymbol } from "./trade-manager.handlers";

const server = getApiServer(Service.manager);

export const queueEntryForSymbol = async (request: { params: any; body?: any }) => {
    const symbol = request.params.symbol as string;
    const epoch = request.body && (request.body.epoch as number);

    try {
        const result = await enterSymbol(symbol, epoch);

        return result;
    } catch (e) {
        return [];
    }
};
server.post("/enter_position/:symbol", queueEntryForSymbol);

export const rebalance = async (request: { params: any; body?: any }) => {
    const symbol = request.params.symbol as string;
    const epoch = request.body && (request.body.epoch as number);
    const calendar = request.body && (request.body.calendar as Calendar[]);

    try {
        const result = await rebalanceForSymbol(symbol, calendar, epoch);

        return true;
    } catch (e) {
        return false;
    }
};
server.post("/rebalance/:symbol", rebalance);
