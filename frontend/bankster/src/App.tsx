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

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
}));

export interface AppState {
    drawerOpen: boolean;
}

function App() {
    const classes = useStyles();

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    return (
        <AppContext.Provider
            value={{
                drawerOpen,
                setDrawerOpen,
            }}
        >
            <Router>
                <Switch>
                    <Route
                        exact
                        path="/"
                        render={() => {
                            return <Redirect to="/backtest"></Redirect>;
                        }}
                    ></Route>
                    <Route path="/backtest"></Route>
                    <Route path="/about"></Route>
                    <Route path="/dashboard"></Route>
                </Switch>
                <div>
                    <AppBar position="static">
                        <Toolbar>
                            <IconButton
                                edge="start"
                                className={classes.menuButton}
                                color="inherit"
                                aria-label="menu"
                                onClick={() => setDrawerOpen(true)}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <Drawer
                        anchor="left"
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                    >
                        <MenuList></MenuList>
                    </Drawer>
                </div>
            </Router>
        </AppContext.Provider>
    );
}

export default App;
