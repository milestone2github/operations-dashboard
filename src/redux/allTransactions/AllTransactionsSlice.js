import { createSlice } from "@reduxjs/toolkit"
import { getFilteredTransactions } from "./AllTransactionsAction"

const initialState = {
  transactions: [],
  page: 0,
  totalCount: 0,
  totalAmount: 0,
  status: 'idle', // pending | failed | completed
  error: null
}

const allTransactionsSlice = createSlice({
  name: 'allTransactions',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(getFilteredTransactions.pending, (state) => {
      state.status = 'pending'
      state.error = null
    })
    builder.addCase(getFilteredTransactions.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.payload
    })
    builder.addCase(getFilteredTransactions.fulfilled, (state, action) => {
      state.status = 'completed'
      state.transactions = action.payload.transactions
      state.page = action.payload.page
      state.totalCount = action.payload.totalCount
      state.totalAmount = action.payload.totalAmount
    })
  }
})

export default allTransactionsSlice.reducer