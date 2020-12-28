import { readJSONSync } from "fs-extra";
import { getDirectionalMovementIndex } from "./dmi";

const fixture = readJSONSync("./fixtures/dmi.json");

test("dmi", () => {
    const { pdmi, ndmi } = getDirectionalMovementIndex(fixture);

    expect(pdmi.length).toEqual(fixture.length - 1);
});
