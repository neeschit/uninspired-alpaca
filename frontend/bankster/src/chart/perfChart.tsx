import { makeStyles, useTheme } from "@material-ui/core";
import {
    createChart,
    CrosshairMode,
    IChartApi,
    ISeriesApi,
} from "lightweight-charts";
import * as React from "react";
import { BacktestResult } from "../startBacktest/backtestModel";

const useStyles = makeStyles(() => ({
    legend: {
        width: "96px",
        height: "80px",
        position: "absolute",
        boxSizing: "border-box",
        display: "none",
        fontSize: "12px",
        color: "yellow",
        backgroundColor: "transparent",
        textAlign: "left",
        top: 100,
        zIndex: 1000,
        pointerEvents: "none",
    },
}));
export const ComplexPerformanceChart = ({
    backtest,
}: {
    backtest: BacktestResult;
}) => {
    const pnlRef = React.useRef<any>();
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const pnlChartObject = React.useRef<IChartApi>();
    const theme = useTheme();
    const styles = useStyles();

    const [currentLeverageValue, setLeverageValue] = React.useState("");

    const [dimensions, setDimensions] = React.useState({
        height: window.innerHeight,
        width: window.innerWidth,
    });

    const pnlSeries = React.useRef<ISeriesApi<"Line">>();
    const leverageSeries = React.useRef<ISeriesApi<"Line">>();
    const tradeCountSeries = React.useRef<ISeriesApi<"Line">>();

    React.useEffect(() => {
        pnlChartObject.current = createChart(pnlRef.current, {
            height: 600,
            width: pnlRef.current?.offsetWidth,
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
            },
        });

        pnlSeries.current = pnlChartObject.current.addLineSeries({
            priceLineVisible: false,
        });

        leverageSeries.current = pnlChartObject.current.addLineSeries({
            color: "#26a69a",
            priceScaleId: "",
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        return () => {
            pnlChartObject.current?.remove();
        };
    }, []);

    React.useEffect(() => {
        const pnlValues = backtest.results.map((b, index, array) => {
            const pnl = array.slice(0, index).reduce((sum, day) => {
                return sum + day.pnl;
            }, 0);
            return {
                value: pnl,
                time: b.startDate,
            };
        });
        pnlSeries.current?.setData(pnlValues);

        const leverageValues = backtest.results.map((b) => ({
            value: b.maxLeverage,
            time: b.startDate,
        }));

        leverageSeries.current?.setData(leverageValues);

        const tradeCounts = backtest.results.map((b) => ({
            value: b.positions.length,
            time: b.startDate,
        }));
        tradeCountSeries.current?.setData(tradeCounts);

        pnlRef.current?.scrollIntoView();
    }, [backtest]);

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
        if (pnlRef.current) {
            pnlChartObject.current?.resize(
                pnlRef.current.offsetWidth,
                600,
                true
            );
            pnlChartObject.current?.timeScale().fitContent();
        }
    }, [dimensions]);

    React.useEffect(() => {
        const toolTipWidth = 80;
        pnlChartObject.current?.subscribeCrosshairMove((param) => {
            if (!tooltipRef.current) {
                return;
            }
            if (!param.time || !leverageSeries.current || !param.point) {
                tooltipRef.current.style.display = "none";
                return;
            }

            const price = param.seriesPrices.get(
                leverageSeries.current
            ) as number;

            if (!price) {
                tooltipRef.current.style.display = "none";
                return;
            }

            const shiftedCoordinate = Math.max(
                0,
                Math.min(
                    pnlRef.current.clientWidth - toolTipWidth,
                    param.point.x
                )
            );
            const coordinate = leverageSeries.current.priceToCoordinate(price);

            if (!coordinate) {
                tooltipRef.current.style.display = "none";
                return null;
            }

            tooltipRef.current.style.left = `${shiftedCoordinate}px`;
            tooltipRef.current.style.top = `900px`;
            tooltipRef.current.style.display = "initial";
            setLeverageValue(price.toFixed());
        });
    }, [backtest]);

    return (
        <>
            <div
                ref={pnlRef}
                style={{ margin: theme.spacing(1), boxSizing: "border-box" }}
            >
                <div ref={tooltipRef} className={styles.legend}>
                    {currentLeverageValue}
                </div>
            </div>
        </>
    );
};
