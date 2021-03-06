export const similarCompanies: string[][] = [
    ["VZ", "TMUS", "T", "LUMN"],
    ["ATVI", "EA"],
    ["PHM", "DHI", "LEN"],
    ["F", "GM"],
    ["CPB", "GIS", "CAG"],
    ["CL", "PG"],
    ["KO", "PEP"],
    ["PM", "MO"],
    ["NCLH", "CCL", "RCL"],
    ["MGM", "WYNN", "LVS"],
    ["VIAC", "FOXA"],
    ["DISCA", "CMCSA", "DISH"],
    ["DIS", "NFLX"],
    ["AMD", "NVDA", "INTC"],
    ["ADI", "MU", "XLNX", "AVGO", "TXN", "QCOM", "MXIM"],
    ["HWM", "BA"],
    ["WDC", "STX"],
    [
        "OXY",
        "COP",
        "APA",
        "MRO",
        "FANG",
        "VLO",
        "PSX",
        "HES",
        "MPC",
        "COG",
        "CVX",
        "PXD",
        "DVN",
        "XOM",
        "EOG",
        "HFC",
    ],
    ["PBCT", "COF", "BAC", "JPM", "KEY", "RF", "BK", "USB", "WFC"],
    ["TFC", "FITB", "HBAN", "STT", "CFG"],
    ["MET", "PGR", "HIG", "ALL", "CB", "UNM", "AFL", "AIG"],
    ["BEN", "GS", "MS", "IVZ", "SCHW"],
    ["AXP", "SYF", "DFS", "V", "MA"],
    ["C", "PRU"],
    ["CNC", "UNH"],
    ["ABBV", "LLY", "PFE", "JNJ", "VTRS", "BMY", "MRK"],
    ["MDT", "EW", "HOLX", "ABT", "BAX", "DHR", "BSX"],
    ["GILD", "AMGN", "ALXN"],
    ["BKR", "NOV", "HAL"],
    ["KMI", "WMB", "SLB", "OKE"],
    ["MOS", "ADM", "BLL", "IP", "AMCR", "CTVA", "DD", "DOW"],
    ["ETN", "EMR"],
    ["WMT", "AMZN"],
    ["HD", "LOW"],
    ["WBA", "CVS"],
    ["COST", "TGT"],
    ["GPS", "LB"],
    ["TWTR", "FB"],
    ["LUV", "DAL", "AAL", "UAL"],
    ["FDX", "UPS"],
    ["CSCO", "JNPR"],
    ["CSX", "UNP"],
    [
        "NEE",
        "SO",
        "AEP",
        "AES",
        "D",
        "CNP",
        "EXC",
        "PPL",
        "NRG",
        "ED",
        "CMS",
        "XEL",
        "DUK",
        "PEG",
        "FE",
    ],
];

export interface SectorMap {
    [index: string]: number;
}

export const similarCompaniesMap: SectorMap = similarCompanies.reduce(
    (map: SectorMap, subArray, index) => {
        for (const symbol of subArray) {
            map[symbol] = index;
        }
        return map;
    },
    {}
);
