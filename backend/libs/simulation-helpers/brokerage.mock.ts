import { BrokerStrategy } from "../brokerage-helpers/brokerage.strategy";

export const mockBrokerage: BrokerStrategy = {
    closePosition: jest.fn(),
    createBracketOrder: jest.fn(),
    createSimpleOrder: jest.fn(),
    createOneTriggersAnotherOrder: jest.fn(),
    getOpenPositions: jest.fn(),
    getOpenOrders: jest.fn(),
    cancelAlpacaOrder: jest.fn(),
};
