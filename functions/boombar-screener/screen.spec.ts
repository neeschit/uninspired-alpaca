import { client, isBoomBar } from "./screener";

const fridayThirtiethApril = 1619789701000;
const symbol = "AMGN";

test("isBoomBar for friday 4/30 AMGN", async () => {
    const screened = await isBoomBar({
        symbol,
        epoch: fridayThirtiethApril,
    });

    expect(screened).toEqual(true);
});

afterAll(() => {
    client.quit();
});
