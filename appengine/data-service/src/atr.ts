import Alpaca from "@neeschit/alpaca-trade-api";
import { addBusinessDays, formatISO, startOfDay } from "date-fns";
import { getAverageTrueRange } from "@neeschit/symbol-data";

const alpaca = Alpaca({
    keyId: process.env.ALPACA_SECRET_KEY_ID!,
    secretKey: process.env.ALPACA_SECRET_KEY!,
    paper: true,
    usePolygon: false,
});

export const getDailyAtr = async ({
    epoch,
    symbol,
}: {
    epoch: number;
    symbol: string;
}) => {
    const barsResponse = alpaca.getBarsV2(
        symbol,
        {
            start: formatISO(addBusinessDays(startOfDay(epoch), -20)),
            end: formatISO(startOfDay(epoch)),
            limit: 40,
            timeframe: "1Day",
        },
        alpaca.configuration
    );

    const bars = [];

    for await (const b of barsResponse) {
        bars.push(b);
    }

    const { atr } = getAverageTrueRange(bars, false);

    return atr[atr.length - 1].value;
};
