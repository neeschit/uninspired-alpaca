import React from "react";
import {
    makeStyles,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
} from "@material-ui/core";
import { Link, useLocation } from "react-router-dom";
import AddIcon from "@material-ui/icons/Add";
import BookIcon from "@material-ui/icons/Book";
import BusinessIcon from "@material-ui/icons/Business";
import HistoryIcon from "@material-ui/icons/History";
import clsx from "clsx";
import { AppContext } from "../appContext";

const useStyles = makeStyles((theme) => ({
    containerList: {
        width: 250,
        backgroundColor: theme.palette.background.paper,
    },
    list: {
        listStyle: "none",
        position: "unset",
        padding: 0,
        marginTop: 10,
    },
    item: {
        position: "relative",
        display: "block",
        textDecoration: "none",
        width: "auto",
        transition: "all 300ms linear",
        color: theme.palette.text.primary,
    },
    selectedListItem: {
        backgroundColor: theme.palette.grey[200],
    },
}));

export const MenuList = () => {
    const styles = useStyles();
    const { setDrawerOpen } = React.useContext(AppContext);
    const location = useLocation();
    return (
        <div
            role="presentation"
            className={styles.containerList}
            onClick={() => setDrawerOpen(false)}
        >
            <List className={styles.list}>
                {[
                    {
                        text: "Start Backtest",
                        path: "/backtest",
                        icon: <AddIcon />,
                    },
                    { text: "Trades", path: "/trades", icon: <BookIcon /> },
                    { text: "Orders", path: "/orders", icon: <BusinessIcon /> },
                    {
                        text: "View Backtests",
                        path: "/history",
                        icon: <HistoryIcon />,
                    },
                ].map((item) => {
                    const isActiveRoute =
                        location.pathname.indexOf(item.path) !== -1;
                    return (
                        <Link
                            to={item.path}
                            className={clsx(
                                styles.item,
                                isActiveRoute && styles.selectedListItem
                            )}
                        >
                            <ListItem button key={item.text}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        </Link>
                    );
                })}
                <Divider />
            </List>
        </div>
    );
};
