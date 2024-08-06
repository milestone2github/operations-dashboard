import { createSlice } from "@reduxjs/toolkit"
import { getNfoTransactions } from "./NfoAction"

const initialState = {
  transactions: [],
  page: 0,
  status: 'idle', // pending | failed | completed
  error: null
}

const nfoSlice = createSlice({
  initialState,
  name: 'nfoTransactions',
  extraReducers: (builder) => {
    builder.addCase(getNfoTransactions.pending, (state) => {
      state.status = 'pending'
      state.error = null
    })
    builder.addCase(getNfoTransactions.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.payload
    })
    builder.addCase(getNfoTransactions.fulfilled, (state, action) => {
      state.status = 'completed'
      state.transactions = action.payload.transactions
      state.page = action.payload.page
    })
  }
})

export default nfoSlice.reducer