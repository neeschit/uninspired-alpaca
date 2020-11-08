import { getApiServer, Service } from "../../src/util/api";
import { enterSymbol } from "./trade-manager.handlers";

const server = getApiServer(Service.manager);

export const queueEntryForSymbol = async (request: { params: any }) => {
    const symbol = request.params.symbol as string;

    try {
        const result = await enterSymbol(symbol);

        return result;
    } catch (e) {
        return [];
    }
};

server.get("/enter_position/:symbol", queueEntryForSymbol);
