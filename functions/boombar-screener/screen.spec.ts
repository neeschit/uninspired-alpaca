import { isBoomBar } from "./index";

const fridayThirtiethApril = 1619789701000;
const symbol = "AMGN";

test("isBoomBar for friday 4/30 AMGN", async () => {
    const screened = isBoomBar({
        symbol,
        epoch: fridayThirtiethApril,
    });

    expect(screened).toEqual(true);
});
