import { Exchange } from "@neeschit/alpaca-trade-api";
import { alpaca } from "../../brokerage-helpers/alpaca";
import { getStockFinancials, getTickerDetails } from "../resources/polygon";
import { LOGGER } from "../instrumentation/log";

const allowedCountries = ["usa", "chn", "hkg", "can"];

export const getAlpacaCompanies = async () => {
    const assets = await alpaca.getAssets({
        status: "active",
        asset_class: "us_equity",
    });

    return assets;
};

export const getCompaniesByMarketCap = async (marketcap: number) => {
    const companies = (await getAlpacaCompanies()).filter(
        (c) => c.exchange === Exchange.NASDAQ || c.exchange === Exchange.NYSE
    );

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
            const details: any = await getStockFinancials(companies[i].symbol);

            const results = details.results;

            /* if (results.length) console.log(Object.keys(results[0])); */

            if (results.length && results[0].marketCapitalization > marketcap) {
                const details: any = await getTickerDetails(
                    companies[i].symbol
                );
                const isAllowedCountry =
                    allowedCountries.indexOf(details.country) !== -1;

                if (isAllowedCountry) {
                    filteredAssets.push(companies[i].symbol);
                }
            }
        } catch (e) {}
    }

    return filteredAssets.sort();
};
