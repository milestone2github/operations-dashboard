import { createSlice } from "@reduxjs/toolkit"
import { approveReconciliation, getRecoTransactions, reconcileTransaction } from "./ReconciliationAction"

const initialState = {
  transactions: [],
  status: 'idle', // pending | failed | completed 
  error: null,
  totalCount: 0,
  totalAmount: 0,
  page: 0,
  updateStatus: 'idle', // pending | failed | completed 
  updateError: null
}

const reconciliationSlice = createSlice({
  name: 'reconciliation',
  initialState,
  reducers: {
    resetErrors(state) {
      state.status = 'idle'
      state.error = null
      state.updateError = null
      state.updateStatus = 'idle'
    }
  },
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


    builder.addCase(reconcileTransaction.pending, (state) => {
      state.updateStatus = 'pending'
      state.updateError = null
    })
    builder.addCase(reconcileTransaction.rejected, (state, action) => {
      state.updateStatus = 'failed'
      state.updateError = action.payload
    })
    builder.addCase(reconcileTransaction.fulfilled, (state, action) => {
      const transaction = action.payload
      state.transactions = state.transactions.map(item =>
        item._id === transaction._id ? transaction : item
      )
      state.updateStatus = 'completed'
    })


    builder.addCase(approveReconciliation.pending, (state) => {
      state.updateStatus = 'pending'
      state.updateError = null
    })
    builder.addCase(approveReconciliation.rejected, (state, action) => {
      state.updateStatus = 'failed'
      state.updateError = action.payload
    })
    builder.addCase(approveReconciliation.fulfilled, (state, action) => {
      const transaction = action.payload;

      state.transactions = state.transactions.map(item => 
        item._id === transaction._id ? transaction : item
      );

      state.updateStatus = 'completed';
    });
  }
})

export const { resetErrors } = reconciliationSlice.actions
export default reconciliationSlice.reducer