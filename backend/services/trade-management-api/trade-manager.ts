import { Calendar } from "@neeschit/alpaca-trade-api";
import { getApiServer, Service } from "../../libs/core-utils/util/api";
import { rebalanceForSymbol } from "./trade-manager.handlers";
import { brokerImpl } from "../../libs/brokerage-helpers/alpaca";

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
