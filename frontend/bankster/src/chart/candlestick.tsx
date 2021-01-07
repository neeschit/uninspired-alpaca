import React from "react";
import {
    createChart,
    CrosshairMode,
    IChartApi,
    IPriceLine,
    ISeriesApi,
    LineStyle,
    SeriesMarker,
    SeriesMarkerPosition,
    SeriesMarkerShape,
    UTCTimestamp,
} from "lightweight-charts";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
    backtestBaseUrl,
    BacktestPosition,
    Bar,
    PositionDirection,
} from "../startBacktest/backtestModel";
import { format, parseISO, startOfDay } from "date-fns";

const useStyles = makeStyles((theme) => ({
    legend: {
        position: "relative",
        left: "12px",
        top: "20px",
        zIndex: 100,
        fontSize: "16px",
        lineHeight: "18px",
        fontWeight: 600,
        color: "yellow",
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

    const response = await fetch(`${backtestBaseUrl}/fetchBars`, {
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
    addPlannedPricelinesForPosition,
}: {
    symbolToGraph: {
        symbol: string;
        entryTime: string;
    };
    selectedPosition: BacktestPosition | null;
    addPlannedPricelinesForPosition: boolean;
}) {
    const chartRef = React.useRef<any>();
    const chartObject = React.useRef<IChartApi>();

    const seriesRef = React.useRef<ISeriesApi<"Candlestick">>();
    const volumeRef = React.useRef<ISeriesApi<"Histogram">>();

    const classes = useStyles();
    const upColor = "#29a67c";
    const downColor = "#e83b3e";

    const [legendMessage, setLegendMessage] = React.useState("");

    const theme = useTheme();

    React.useEffect(() => {
        chartObject.current = createChart(chartRef.current as any, {
            width: chartRef.current?.offsetWidth,
            height: 600,
            layout: {
                backgroundColor: "#10121a",
                textColor: "rgba(255, 255, 255, 0.9)",
            },
            grid: {
                vertLines: {
                    color: "rgba(197, 203, 206, 0.1)",
                },
                horzLines: {
                    color: "rgba(197, 203, 206, 0.1)",
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
        volumeRef.current = chartObject.current.addHistogramSeries({
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
        seriesRef.current = chartObject.current.addCandlestickSeries({
            upColor: upColor,
            downColor: downColor,
            borderDownColor: downColor,
            borderUpColor: upColor,
            wickDownColor: downColor,
            wickUpColor: upColor,
            priceLineVisible: false,
        });

        return () => {
            chartObject.current?.remove();
        };
    }, []);

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
    const [dimensions, setDimensions] = React.useState({
        height: window.innerHeight,
        width: window.innerWidth,
    });
    React.useEffect(() => {
        function handleResize() {
            setDimensions({
                height: window.innerHeight,
                width: window.innerWidth,
            });
        }

        window.addEventListener("resize", handleResize);
    }, []);

    React.useEffect(() => {
        if (chartRef.current) {
            chartObject.current?.resize(
                chartRef.current.offsetWidth,
                600,
                true
            );
            chartObject.current?.timeScale().fitContent();
        }
    }, [dimensions]);

    React.useEffect(() => {
        seriesRef.current?.setData(currentBars);
        volumeRef.current?.setData(currentVolume);
        chartObject.current?.timeScale().fitContent();
        chartObject.current?.priceScale().applyOptions({
            autoScale: true,
        });
        if (currentBars.length) {
            chartRef.current?.scrollIntoView();
        }
    }, [currentBars, currentVolume]);

    React.useEffect(() => {
        const options = seriesRef.current?.options();
        if (!selectedPosition || !currentBars) {
            seriesRef.current?.setMarkers([]);
            seriesRef.current?.applyOptions({
                ...options,
                priceLineVisible: false,
            });
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
        return () => {
            seriesRef.current?.setMarkers([]);
        };
    }, [currentBars, selectedPosition]);

    React.useEffect(() => {
        const pricelines: Array<IPriceLine | undefined> = [];

        if (addPlannedPricelinesForPosition && selectedPosition) {
            const lineWidth = 2;
            console.log("adding to priceline");
            const plannedEntry = seriesRef.current?.createPriceLine({
                price: selectedPosition.plannedEntryPrice,
                color: "#be1238",
                lineWidth: lineWidth,
                lineStyle: LineStyle.SparseDotted,
                axisLabelVisible: true,
                title: "planned entry",
            });

            const plannedStop = seriesRef.current?.createPriceLine({
                price: selectedPosition.plannedExitPrice,
                color: "#be1238",
                lineWidth: lineWidth,
                lineStyle: LineStyle.SparseDotted,
                axisLabelVisible: true,
                title: "planned stop",
            });

            const plannedTarget = seriesRef.current?.createPriceLine({
                price: selectedPosition.plannedTargetPrice,
                color: "#be1238",
                lineWidth: lineWidth,
                lineStyle: LineStyle.SparseDotted,
                axisLabelVisible: true,
                title: "planned target",
            });

            pricelines.push(plannedEntry);
            pricelines.push(plannedStop);
            pricelines.push(plannedTarget);
        }
        return () => {
            for (const line of pricelines) {
                console.log("removing priceline");
                if (line) {
                    seriesRef.current?.removePriceLine(line);
                }
            }
        };
    }, [addPlannedPricelinesForPosition, selectedPosition]);

    React.useEffect(() => {
        chartObject.current?.subscribeCrosshairMove((param) => {
            if (!param.time) {
                return;
            }

            const bar: Bar | undefined = currentBars.find(
                (b) => b.time === param.time
            );

            if (!bar) {
                return;
            }

            setLegendMessage(
                `O${bar.open.toFixed(2)} H${bar.high.toFixed(
                    2
                )} L${bar.low.toFixed(2)} C${bar.close.toFixed(
                    2
                )} V${bar.volume.toLocaleString()}`
            );
        });
    }, [currentBars]);

    return (
        <div ref={chartRef as any} style={{ margin: theme.spacing(1) }}>
            <div className={classes.legend}>{legendMessage}</div>
        </div>
    );
}
