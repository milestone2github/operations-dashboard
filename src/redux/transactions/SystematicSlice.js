import { createSlice } from '@reduxjs/toolkit'
import { getSystematic } from './TransactionsAction'

const initialState = {
  transactions: [],
  isLoading: false,
  error: null
}

const systematicSlice = createSlice({
  name: 'systematic',
  initialState,
  reducers: {
    addFraction: (state, action) => {
      const { index, amount, status } = action.payload
      if (index <= state.transactions.length - 1 && index >= 0) {
        let updated = state.transactions
        updated[index].transactionFractions.push({ fractionAmount: amount, status })
        state.transactions = updated
      }
    },
    removeFraction: (state, action) => {
      const { index, fracIndex, amount } = action.payload
      if (index <= state.transactions.length - 1 && index >= 0) {
        let updated = state.transactions
        updated[index].transactionFractions.splice(fracIndex, 1)
        state.transactions = updated
      }
    },
    updateFractionAmount: (state, action) => {
      const { index, fracIndex, amount } = action.payload
      if (index <= state.transactions.length - 1 && index >= 0) {
        let updated = state.transactions
        updated[index].transactionFractions[fracIndex].fractionAmount = amount
        state.transactions = updated
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(getSystematic.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getSystematic.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload
    })
    builder.addCase(getSystematic.fulfilled, (state, action) => {
      state.isLoading = false
      state.error = null
      state.transactions = action.payload
    })
  }
})

export const { addFraction, removeFraction, updateFractionAmount } = systematicSlice.actions
export default systematicSlice.reducer