import { getApiServer, Service } from "../../libs/core-utils/util/api";
import { currentTradingSymbols } from "../../libs/core-utils/data/filters";
import { getWatchlistForDate } from "./screener.handlers";

const server = getApiServer(Service.screener);

export const watchlistGetter = async (request: { params: any }) => {
    const date = request.params.date;

    try {
        const result = await getWatchlistForDate(currentTradingSymbols, date);

        return result;
    } catch (e) {
        return [];
    }
};

server.get("/watchlist/:date", watchlistGetter);
