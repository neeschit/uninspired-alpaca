declare module "@alpacahq/alpaca-trade-api" {
    export interface AlpacaParams {
        keyId: string;
        secretKey: string;
        paper: boolean;
    }
    export interface GetAssetsParams {
        status: string;
    }

    export interface Asset {
        symbol: string;
    }

    class Alpaca {
        getAssets(params: GetAssetsParams): Asset[];
        constructor(params: AlpacaParams);
    }

    export default Alpaca;
}
