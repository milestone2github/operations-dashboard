import { configureStore } from "@reduxjs/toolkit";
import { navtab } from "./navtoggle/navreducer";
import UserSlice from "./auth/userSlice"
import GroupedTrxSlice from "./groupedTransaction/GroupedTrxSlice";
import TransactionSlice from "./transactions/TransactionSlice";
import FilterOptionsSlice from "./allFilterOptions/FilterOptionsSlice";
import AllTransactionsSlice from "./allTransactions/AllTransactionsSlice";
import NfoSlice from "./nfoTransaction/NfoSlice";
import ReconciliationSlice from "./reconciliation/ReconciliationSlice";
import SavedFiltersSlice from "./savedFilters/SavedFiltersSlice";

export const store = configureStore({
    reducer:{
        nav: navtab,
        user: UserSlice,
        groupedTransactions: GroupedTrxSlice,
        sessionalTransactions: TransactionSlice,
        allFilterOptions: FilterOptionsSlice,
        allTransactions: AllTransactionsSlice,
        nfoTransactions: NfoSlice,
        reconciliation: ReconciliationSlice,
        savedFilters: SavedFiltersSlice
    }
})