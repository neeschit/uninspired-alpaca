import AlpacaClient, { Alpaca } from "@neeschit/alpaca-trade-api";

export class AlpacaClientSingleton {
    private static instance: Alpaca;

    private constructor() {
        AlpacaClientSingleton.create();
    }

    private static create() {
        if (AlpacaClientSingleton.instance) {
            return AlpacaClientSingleton.instance;
        }
        AlpacaClientSingleton.instance = AlpacaClient({
            keyId: process.env.ALPACA_SECRET_KEY_ID!,
            secretKey: process.env.ALPACA_SECRET_KEY!,
            paper: true,
            usePolygon: false,
        });

        return AlpacaClientSingleton.instance;
    }

    public static getClient() {
        return AlpacaClientSingleton.create();
    }
}
