import React from "react";
import {
    createChart,
    CrosshairMode,
    IChartApi,
    ISeriesApi,
    SeriesMarker,
    SeriesMarkerPosition,
    SeriesMarkerShape,
    UTCTimestamp,
} from "lightweight-charts";
import { makeStyles } from "@material-ui/core";
import {
    BacktestPosition,
    Bar,
    PositionDirection,
} from "../startBacktest/backtestModel";
import { format, parseISO, startOfDay } from "date-fns";

const useStyles = makeStyles((theme) => ({
    legend: {
        position: "relative",
        left: "12px",
        top: "12px",
        zIndex: 100,
        fontSize: "12px",
        lineHeight: "18px",
        fontWeight: 300,
        color: "#FFFFFF",
    },
}));

const getDataForDate = async ({
    symbol,
    fromEpoch,
}: {
    symbol: string;
    fromEpoch: number;
}): Promise<Bar[]> => {
    if (!symbol || !fromEpoch) {
        return [];
    }

    const response = await fetch(`http://localhost:6971/fetchBars`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
            fromEpoch,
            duration: "5 minutes",
            symbol,
        }),
    });

    if (!response.ok) {
        return [];
    }

    return response.json();
};

export function Candlestick({
    symbolToGraph,
    selectedPosition,
}: {
    symbolToGraph: {
        symbol: string;
        entryTime: string;
    };
    selectedPosition: BacktestPosition | null;
}) {
    const chartRef = React.useRef<IChartApi>();

    const seriesRef = React.useRef<ISeriesApi<"Candlestick">>();
    const volumeRef = React.useRef<ISeriesApi<"Histogram">>();

    const classes = useStyles();
    const upColor = "#29a67c";
    const downColor = "#e83b3e";

    React.useEffect(() => {
        const chart = createChart(chartRef.current as any, {
            width: 1520,
            height: 600,
            layout: {
                backgroundColor: "#10121a",
                textColor: "rgba(255, 255, 255, 0.9)",
            },
            grid: {
                vertLines: {
                    color: "rgba(197, 203, 206, 0.5)",
                },
                horzLines: {
                    color: "rgba(197, 203, 206, 0.5)",
                },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: "rgba(197, 203, 206, 0.8)",
            },
            timeScale: {
                borderColor: "rgba(197, 203, 206, 0.8)",
                timeVisible: true,
                secondsVisible: false,
                tickMarkFormatter: (time: UTCTimestamp) => {
                    return format(time * 1000, "hh:mm");
                },
            },
            localization: {
                timeFormatter: (time: UTCTimestamp) => {
                    return format(time * 1000, "yyyy-MM-dd hh:mm");
                },
            },
        });
        volumeRef.current = chart.addHistogramSeries({
            color: "#26a69a",
            priceFormat: {
                type: "volume",
            },
            priceScaleId: "",
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });
        seriesRef.current = chart.addCandlestickSeries({
            upColor: upColor,
            downColor: downColor,
            borderDownColor: "#6c262b",
            borderUpColor: "#194d4b",
            wickDownColor: downColor,
            wickUpColor: upColor,
        });

        return () => {
            chart.remove();
        };
    }, [selectedPosition, symbolToGraph]);

    const [currentBars, setCurrentBars] = React.useState<Bar[]>([]);
    const [currentVolume, setCurrentVolume] = React.useState<
        {
            value: number;
            time: any;
            color: string;
        }[]
    >([]);

    const [currentChartOptions, setCurrentChartOptions] = React.useState({
        startEpoch: 0,
        symbol: "",
    });

    React.useEffect(() => {
        const fromEpoch = startOfDay(
            parseISO(symbolToGraph.entryTime)
        ).getTime();

        if (
            currentChartOptions.symbol === symbolToGraph.symbol &&
            currentChartOptions.startEpoch === fromEpoch
        ) {
            return;
        }

        setCurrentChartOptions({
            symbol: symbolToGraph.symbol,
            startEpoch: fromEpoch,
        });

        getDataForDate({ symbol: symbolToGraph.symbol, fromEpoch }).then(
            (bars) => {
                const mappedVolume = bars.map((b) => {
                    return {
                        value: b.volume,
                        time: b.time,
                        color: b.open > b.close ? upColor : downColor,
                    };
                });
                setCurrentBars(bars);
                setCurrentVolume(mappedVolume);
            }
        );
    }, [
        currentChartOptions.startEpoch,
        currentChartOptions.symbol,
        symbolToGraph,
    ]);

    React.useEffect(() => {
        seriesRef.current?.setData(currentBars);
        volumeRef.current?.setData(currentVolume);
    }, [currentBars, currentVolume]);

    React.useEffect(() => {
        if (!selectedPosition || !currentBars) {
            seriesRef.current?.setMarkers([]);
            return;
        }
        const entryTime = parseISO(selectedPosition.entryTime).getTime() / 1000;

        const entryBarIndex = currentBars.findIndex((b) => {
            return entryTime < b.time;
        });

        if (entryBarIndex < 0) {
            return;
        }

        const entryBar = currentBars[entryBarIndex - 1];

        if (!entryBar) {
            return;
        }
        const exitTime = parseISO(selectedPosition.exitTime).getTime() / 1000;
        const exitBarIndex = currentBars.findIndex((b) => exitTime < b.time);

        const exitBar = currentBars[exitBarIndex - 1];

        if (!exitBar) {
            return;
        }

        const markers: SeriesMarker<any>[] = [];

        const [
            entryMarkerPosition,
            exitMarkerPosition,
        ]: SeriesMarkerPosition[] =
            selectedPosition.side === PositionDirection.long
                ? ["belowBar", "aboveBar"]
                : ["aboveBar", "belowBar"];
        const [entryShape, exitShape]: SeriesMarkerShape[] =
            selectedPosition.side === PositionDirection.long
                ? ["arrowUp", "arrowDown"]
                : ["arrowDown", "arrowUp"];

        const [entryColor, exitColor] =
            selectedPosition.side === PositionDirection.long
                ? ["#2196F3", "#e91e63"]
                : ["#e91e63", "#2196F3"];

        markers.push({
            shape: entryShape,
            time: entryBar.time,
            position: entryMarkerPosition,
            color: entryColor,
            text: `${
                selectedPosition.qty
            } @ ${selectedPosition.averageEntryPrice.toFixed(2)}`,
        });

        markers.push({
            shape: exitShape,
            time: exitBar.time,
            position: exitMarkerPosition,
            color: exitColor,
            text: `${
                selectedPosition.qty
            } @ ${selectedPosition.averageExitPrice.toFixed(2)}`,
        });

        seriesRef.current?.setMarkers(markers);
    }, [currentBars, selectedPosition, symbolToGraph.symbol]);

    return (
        <div ref={chartRef as any}>
            <div className={classes.legend}></div>
        </div>
    );
}
