import { alpaca } from "../resources/alpaca";
import { getTickerDetails } from "../resources/polygon";
import { LOGGER } from "../instrumentation/log";

const allowedCountries = ["usa", "chn", "hkg", "can"];

export const getAlpacaCompanies = async () => {
    const assets = await alpaca.getAssets({
        status: "active",
    });

    return assets;
};

export const getCompaniesByMarketCap = async (marketcap: number) => {
    const companies = await getAlpacaCompanies();

    const filteredAssets = [];

    const buckets = Math.floor(companies.length / 10);

    for (let i = 0; i < companies.length; i++) {
        if (companies[i].symbol.length > 4) {
            LOGGER.debug(`skipping ${companies[i].symbol}`);
            continue;
        }
        if (i % buckets === 0) {
            LOGGER.info("completed " + i + " assets");
        }
        try {
            const details: any = await getTickerDetails(companies[i].symbol);

            if (
                details &&
                details.marketcap > marketcap &&
                allowedCountries.indexOf(details.country) !== -1 &&
                details.type === "CS"
            ) {
                filteredAssets.push(companies[i].symbol);
            }
        } catch (e) {}
    }

    return filteredAssets;
};
