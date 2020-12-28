import { Calendar } from "@neeschit/alpaca-trade-api";
import { getApiServer, Service } from "../../src/util/api.js";
import { rebalanceForSymbol } from "./trade-manager.handlers.js";
import { brokerImpl } from "../brokerage-helpers/alpaca.js";

const server = getApiServer(Service.manager);

export const rebalance = async (request: { params: any; body?: any }) => {
    const symbol = request.params.symbol as string;
    const epoch = request.body && (request.body.epoch as number);
    const calendar = request.body && (request.body.calendar as Calendar[]);

    try {
        const result = await rebalanceForSymbol(
            symbol,
            calendar,
            brokerImpl,
            epoch
        );

        return true;
    } catch (e) {
        return false;
    }
};
server.post("/rebalance/:symbol", rebalance);
