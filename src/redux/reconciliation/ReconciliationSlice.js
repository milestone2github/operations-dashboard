import { createSlice } from "@reduxjs/toolkit"
import { getRecoTransactions } from "./ReconciliationAction"

const initialState = {
  transactions : [],
  status: 'idle', // pending | failed | completed 
  error: null
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
      state.status = 'completed'
      state.transactions = action.payload
    })
  }
})

export const {} = reconciliationSlice.actions
export default reconciliationSlice.reducer