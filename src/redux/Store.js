import { configureStore } from "@reduxjs/toolkit";
import { navtab } from "./navtoggle/navreducer";
import { userauth } from "./auth/userreducer";
import GroupedTrxSlice from "./groupedTransaction/GroupedTrxSlice";
import SystematicSlice from "./transactions/SystematicSlice";
import PurchRedempSlice from "./transactions/PurchRedempSlice";
import SwitchSlice from "./transactions/SwitchSlice";

export const store = configureStore({
    reducer:{
        nav: navtab,
        auth: userauth,
        groupedTransactions: GroupedTrxSlice,
        systematic: SystematicSlice,
        purchRedemp: PurchRedempSlice,
        switch: SwitchSlice,
    }
})