import { Calendar } from "@neeschit/alpaca-trade-api";

export interface DataRequest {
    symbol: string;
    epoch: number;
    calendar: Calendar[];
}

export interface GapDataRequest extends DataRequest {
    limit: number;
}
