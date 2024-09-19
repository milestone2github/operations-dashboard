import { createSlice } from "@reduxjs/toolkit"
import { getRecoTransactions } from "./ReconciliationAction"

const initialState = {
  transactions : [],
  status: 'idle', // pending | failed | completed 
  error: null,
  totalCount: 0,
  totalAmount: 0,
  page: 0,
}

const reconciliationSlice = createSlice({
  name: 'reconciliation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getRecoTransactions.pending, (state) => {
      state.status = 'pending'
      state.error = null
    })
    builder.addCase(getRecoTransactions.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.payload
    })
    builder.addCase(getRecoTransactions.fulfilled, (state, action) => {
      const { transactions, totalAmount, totalCount, page } = action.payload
      state.status = 'completed'
      state.transactions = transactions
      state.totalCount = totalCount
      state.totalAmount = totalAmount
      state.page = page
    })
  }
})

export const {} = reconciliationSlice.actions
export default reconciliationSlice.reducer