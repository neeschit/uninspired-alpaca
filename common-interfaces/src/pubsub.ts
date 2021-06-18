import { SimpleBar } from "./bar";

export interface BoomBarReply {
    side?: any;
    limitPrice?: number;
    relativeRange?: number;
    relativeVolume?: number;
    isInPlay: boolean;
    symbol: string;
    epoch: number;
    strategy: any;
}

export interface BoomBarRequest {
    epoch: number;
    symbol: string;
    pubsubchannel: string;
    calendar: any;
}

export interface BoomBreakerDataPoints {
    nrbToBoomRatio: number;
    distanceFromVwap: number;
    distanceFromBoomBarRange: number;
    boomBarRetracementSoFar: number;
    nrb: SimpleBar;
}
