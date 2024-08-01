import { configureStore } from "@reduxjs/toolkit";
import { navtab } from "./navtoggle/navreducer";
import UserSlice from "./auth/userSlice"
import GroupedTrxSlice from "./groupedTransaction/GroupedTrxSlice";
import SystematicSlice from "./transactions/SystematicSlice";
import PurchRedempSlice from "./transactions/PurchRedempSlice";
import SwitchSlice from "./transactions/SwitchSlice";
import TransactionSlice from "./transactions/TransactionSlice";
import FilterOptionsSlice from "./allFilterOptions/FilterOptionsSlice";
import AllTransactionsSlice from "./allTransactions/AllTransactionsSlice";

export const store = configureStore({
    reducer:{
        nav: navtab,
        user: UserSlice,
        groupedTransactions: GroupedTrxSlice,
        sessionalTransactions: TransactionSlice,
        allFilterOptions: FilterOptionsSlice,
        allTransactions: AllTransactionsSlice
        // systematic: SystematicSlice,
        // purchRedemp: PurchRedempSlice,
        // switch: SwitchSlice,
    }
})