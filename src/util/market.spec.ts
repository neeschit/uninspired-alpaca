import test from "ava";
import { isMarketOpen, isAfterMarketOpen, isBeforeMarketClose } from "./market";

test("is closed - late hours", t => {
    t.falsy(isMarketOpen(new Date("2020-02-17T04:14:46")));
});

test("is closed - late hours - isBeforeMarketOpen", t => {
    t.falsy(isAfterMarketOpen(new Date("2020-02-17T04:14:46")));
});

test("is closed - late hours - isAfterMarketOpen", t => {
    t.truthy(isBeforeMarketClose(new Date("2020-02-17T04:14:46")));
});

test("is closed - holiday hours", t => {
    t.falsy(isMarketOpen(new Date("2020-02-17T10:14:46")));
});

test("is closed - christmas hours", t => {
    t.falsy(isMarketOpen(new Date("2020-12-25T10:14:46")));
});

test("is open - regular hours", t => {
    t.truthy(isMarketOpen(new Date("2020-07-02T16:14:46.000Z")));
});

test("is open - first second", t => {
    t.truthy(isMarketOpen(new Date("2020-05-01T13:30:00.000Z")));
});

test("is open - timezone", t => {
    t.truthy(isMarketOpen(new Date("2020-05-01T13:30:00-05:00")));
});

test("is open - timezone iso", t => {
    t.truthy(isMarketOpen(new Date("2020-01-22T14:34:46.000Z")));
});

test("is closed - before first second", t => {
    t.falsy(isMarketOpen(new Date("2020-05-01T09:29:59")));
});

test("is closed - after last second", t => {
    t.falsy(isMarketOpen(new Date("2020-05-01T20:00:00.000Z")));
});
