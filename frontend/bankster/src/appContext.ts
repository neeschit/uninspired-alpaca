import React from "react";

export const AppContext = React.createContext({
    drawerOpen: false,
    setDrawerOpen: (val: boolean) => {},
});
