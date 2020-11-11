import { messageService, Service } from "../../src/util/api";

export const enterSymbolForTrade = async (
    symbol: string,
    epoch = Date.now()
): Promise<string[]> => {
    return (await messageService(Service.manager, "/enter_position/" + symbol, {
        body: {
            epoch,
        },
    })) as any;
};
