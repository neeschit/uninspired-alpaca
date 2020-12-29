import React from "react";
import {
    AppBar,
    Toolbar,
    makeStyles,
    IconButton,
    Drawer,
} from "@material-ui/core";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";
import MenuIcon from "@material-ui/icons/Menu";
import { AppContext } from "./appContext";
import { MenuList } from "./menuList/menuList";
import { BacktestStart } from "./startBacktest/backtest";
import { BacktestModel, BacktestPosition } from "./startBacktest/backtestModel";
import { TradesGrid } from "./tradeGrid/tradesGrid";
import { OrdersGrid } from "./orderGrid/ordersGrid";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    appBar: {
        marginBottom: theme.spacing(),
    },
}));

export interface AppState {
    drawerOpen: boolean;
    backtests: BacktestModel[];
}

function App() {
    const classes = useStyles();

    const [appState, setAppState] = React.useState<AppState>({
        drawerOpen: false,
        backtests: [],
    });

    return (
        <AppContext.Provider
            value={{
                drawerOpen: appState.drawerOpen,
                setDrawerOpen: (isOpen: boolean) => {
                    setAppState({
                        backtests: appState.backtests,
                        drawerOpen: isOpen,
                    });
                },
                history: appState.backtests,
                addToBacktestHistory: (
                    startDate: Date,
                    endDate: Date,
                    positions: BacktestPosition[]
                ) => {
                    appState.backtests.push({
                        startDate,
                        endDate,
                        positions,
                    });
                },
            }}
        >
            <Router>
                <div>
                    <AppBar position="static" className={classes.appBar}>
                        <Toolbar>
                            <IconButton
                                edge="start"
                                className={classes.menuButton}
                                color="inherit"
                                aria-label="menu"
                                onClick={() =>
                                    setAppState({
                                        drawerOpen: true,
                                        backtests: appState.backtests,
                                    })
                                }
                            >
                                <MenuIcon />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <Drawer
                        anchor="left"
                        open={appState.drawerOpen}
                        onClose={() =>
                            setAppState({
                                drawerOpen: false,
                                backtests: appState.backtests,
                            })
                        }
                    >
                        <MenuList></MenuList>
                    </Drawer>
                    <Switch>
                        <Route
                            exact
                            path="/"
                            render={() => {
                                return <Redirect to="/backtest"></Redirect>;
                            }}
                        ></Route>
                        <Route
                            path="/backtest"
                            component={BacktestStart}
                        ></Route>
                        <Route path="/trades" component={TradesGrid}></Route>
                        <Route path="/orders" component={OrdersGrid}></Route>
                        <Route path="/history"></Route>
                    </Switch>
                </div>
            </Router>
        </AppContext.Provider>
    );
}

export default App;
