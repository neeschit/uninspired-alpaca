import { getApiServer, Service } from "../../src/util/api";
import { enterSymbol } from "./trade-manager.handlers";

const server = getApiServer(Service.manager);

export const queueEntryForSymbol = async (request: {
    params: any;
    body?: any;
}) => {
    const symbol = request.params.symbol as string;
    const epoch = request.params.body && (request.params.body.epoch as number);

    try {
        const result = await enterSymbol(symbol, epoch);

        return result;
    } catch (e) {
        return [];
    }
};
server.post("/enter_position/:symbol", queueEntryForSymbol);
