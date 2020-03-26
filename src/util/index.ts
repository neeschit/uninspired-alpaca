export * from "./get";

export function roundHalf(num: number) {
    return Math.round(num * 2) / 2;
}

export function floorHalf(num: number) {
    return Math.floor(num * 2) / 2;
}
