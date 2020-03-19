import test from "ava";
import { getSocketManager } from "./polygon";

test.cb("polygon wss auth", t => {
    const sm = getSocketManager();
    const wss = sm.server;
    wss.on("close", () => {
        t.end();
    });

    wss.on("auth", (message: any) => {
        console.log("message", message);
        sm.close();
    });
});

test.cb("polygon wss auth1", t => {
    const sm = getSocketManager();
    const wss = sm.server;
    wss.on("close", () => {
        t.end();
    });

    wss.on("auth", (message: any) => {
        console.log("message", message);
        sm.close();
    });
});
