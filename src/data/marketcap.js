const { alpaca } = require("../connection/alpaca.js");
const { getTickerDetails } = require("../connection/polygon.js");

const allowedCountries = ["usa", "chn", "hkg", "can"];

const getAlpacaCompanies = async () => {
    const assets = await alpaca.getAssets({
        status: "active"
    });

    return assets;
};

const getCompaniesByMarketCap = async marketcap => {
    const companies = await getAlpacaCompanies();

    const filteredAssets = [];

    const buckets = Math.floor(companies.length / 10);

    for (let i = 0; i < companies.length; i++) {
        if (i % buckets === 0) {
            console.log("completed " + i + " assets");
        }
        try {
            const details = await getTickerDetails(companies[i].symbol);

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

module.exports = {
    getAlpacaCompanies,
    getCompaniesByMarketCap
};
