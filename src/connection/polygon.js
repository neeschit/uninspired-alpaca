import dotenv from "dotenv";
import https from "https";
import { get } from "../util/get";

const config = dotenv.config().parsed;

const API_KEY = config.ALPACA_SECRET_KEY_ID;

const getPolygonApiUrl = resourceUrl =>
  `https://api.polygon.io/v1/${resourceUrl}?apiKey=${API_KEY}`;

export const getTickerDetails = symbol => {
  const resourceUrl = `meta/symbols/${symbol.toUpperCase()}/company`;
  const url = getPolygonApiUrl(resourceUrl);

  return get(url);
};
