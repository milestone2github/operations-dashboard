import { createSlice } from "@reduxjs/toolkit"
import { addFraction, generateLink, getTransactionsBySession, removeFraction, saveFractions, updateOrderId } from "./TransactionsAction"

const initialState = {
  systematicTransactions: [],
  purchRedempTransactions: [],
  switchTransactions: [],
  isLoading: false,
  error: null,
  linkGenerateStatus: 'idle', // pending | failed | completed
  orderIdStatus: 'idle' // pending | failed | completed
}

const transactionSlice = createSlice({
  name: 'sessionalTransactions',
  initialState,
  reducers: {

    switchAddFraction: (state, action) => {
      const { index, amount, status } = action.payload
      if (index <= state.switchTransactions.length - 1 && index >= 0) {
        let updated = state.switchTransactions
        updated[index].transactionFractions.push({ 
          fractionAmount: amount,
          status,
          folioNumber: updated[index].folioNumber
        })
        state.switchTransactions = updated
      }
    },
    removeSwitchFraction: (state, action) => {
      const { index, fracIndex, amount } = action.payload
      if (index <= state.switchTransactions.length - 1 && index >= 0) {
        let updated = state.switchTransactions
        updated[index].transactionFractions.splice(fracIndex, 1)
        state.switchTransactions = updated
      }
    },
    updateSwitchApprovalStatus: (state, action) => {
      const { index, approvalStatus } = action.payload
      if (index <= state.switchTransactions.length - 1 && index >= 0) {
        let updated = state.switchTransactions
        updated[index].approvalStatus = approvalStatus
        state.switchTransactions = updated
      }
    },
    updateSwitchFractionAmount: (state, action) => {
      const { index, fracIndex, amount } = action.payload
      if (index <= state.switchTransactions.length - 1 && index >= 0) {
        let updated = state.switchTransactions
        updated[index].transactionFractions[fracIndex].fractionAmount = amount
        state.switchTransactions = updated
      }
    },
    updateSwitchFractionFolio: (state, action) => {
      const { index, fracIndex, folioNumber } = action.payload
      if (index <= state.switchTransactions.length - 1 && index >= 0) {
        let updated = state.switchTransactions
        updated[index].transactionFractions[fracIndex].folioNumber = folioNumber
        state.switchTransactions = updated
      }
    },
    updateSwitchFractionApprovalStatus: (state, action) => {
      const { index, fracIndex, approvalStatus } = action.payload
      if (index <= state.switchTransactions.length - 1 && index >= 0) {
        let updated = state.switchTransactions
        updated[index].transactionFractions[fracIndex].approvalStatus = approvalStatus
        state.switchTransactions = updated
      }
    },

    updateSwitchTransactionDate: (state, action) => {
      const { index, fracIndex, value } = action.payload
      if (index <= state.switchTransactions.length - 1 && index >= 0) {
        let updated = state.switchTransactions
        updated[index].transactionFractions[fracIndex].transactionDate = value
        state.switchTransactions = updated
      }
    },

    cancelSwitchFraction: (state, action) => {
      const { index, fracIndex } = action.payload
      if (index <= state.switchTransactions.length - 1 && index >= 0) {
        let updated = state.switchTransactions
        updated[index].transactionFractions[fracIndex].linkStatus = 'deleted'
        state.switchTransactions = updated
      }
    },

    unlockTransaction: (state, action) => {
      let hasUpdated = false

      for (let index = 0; index < state.systematicTransactions.length; index++) {
        const item = state.systematicTransactions[index];
        if (item._id === action.payload) {
          state.systematicTransactions[index].linkStatus = 'unlocked'
          hasUpdated = true
          break
        }
      }

      if (!hasUpdated) {
        for (let index = 0; index < state.purchRedempTransactions.length; index++) {
          const item = state.purchRedempTransactions[index];
          if (item._id === action.payload) {
            state.purchRedempTransactions[index].linkStatus = 'unlocked'
            hasUpdated = true
            break
          }
        }
      }

      if (!hasUpdated) {
        for (let index = 0; index < state.switchTransactions.length; index++) {
          const item = state.switchTransactions[index];
          if (item._id === action.payload) {
            state.switchTransactions[index].linkStatus = 'unlocked'
            hasUpdated = true
            break
          }
        }
      }
    }
  },

  extraReducers: (builder) => {
    builder.addCase(getTransactionsBySession.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getTransactionsBySession.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload
    })
    builder.addCase(getTransactionsBySession.fulfilled, (state, action) => {
      state.isLoading = false
      state.error = null
      state.systematicTransactions = []
      state.purchRedempTransactions = []
      state.switchTransactions = []
      action.payload.forEach(item => {
        if (item._id === 'systematic') {
          state.systematicTransactions = item.transactions
        }
        else if (item._id === 'purchredemp') {
          state.purchRedempTransactions = item.transactions
        }
        else if (item._id === 'switch') {
          state.switchTransactions = item.transactions
        }
      });
    })

    builder.addCase(saveFractions.pending, (state) => {
      state.error = null
      state.isLoading = true
    })
    builder.addCase(saveFractions.rejected, (state, action) => {
      state.error = action.payload
      state.isLoading = false
    })
    builder.addCase(saveFractions.fulfilled, (state, action) => {
      state.isLoading = false
      let transaction = action.payload
      if (transaction.category === 'systematic') {
        state.systematicTransactions = state.systematicTransactions.map(item =>
          item._id === transaction._id ? transaction : item
        )
      }
      else if (transaction.category === 'purchredemp') {
        state.purchRedempTransactions = state.purchRedempTransactions.map(item =>
          item._id === transaction._id ? transaction : item
        )
      }
      else if (transaction.category === 'switch') {
        state.switchTransactions = state.switchTransactions.map(item =>
          item._id === transaction._id ? transaction : item
        )
      }
    })

    builder.addCase(generateLink.pending, (state) => {
      state.error = null
      state.linkGenerateStatus = 'pending'
    })
    builder.addCase(generateLink.rejected, (state, action) => {
      state.error = action.payload
      state.linkGenerateStatus = 'failed'
    })
    builder.addCase(generateLink.fulfilled, (state, action) => {
      let transaction = action.payload
      if (transaction.category === 'systematic') {
        state.systematicTransactions = state.systematicTransactions.map(item =>
          item._id === transaction._id ? transaction : item
        )
      }
      else if (transaction.category === 'purchredemp') {
        state.purchRedempTransactions = state.purchRedempTransactions.map(item =>
          item._id === transaction._id ? transaction : item
        )
      }
      else if (transaction.category === 'switch') {
        state.switchTransactions = state.switchTransactions.map(item =>
          item._id === transaction._id ? transaction : item
        )
      }
      state.linkGenerateStatus = 'completed'
    })

    builder.addCase(updateOrderId.pending, (state) => {
      state.error = null
      state.orderIdStatus = 'pending'
    })
    builder.addCase(updateOrderId.rejected, (state, action) => {
      state.error = action.payload
      state.orderIdStatus = 'failed'
    })
    builder.addCase(updateOrderId.fulfilled, (state, action) => {
      let transaction = action.payload
      if (transaction.category === 'systematic') {
        state.systematicTransactions = state.systematicTransactions.map(item =>
          item._id === transaction._id ? transaction : item
        )
      }
      else if (transaction.category === 'purchredemp') {
        state.purchRedempTransactions = state.purchRedempTransactions.map(item =>
          item._id === transaction._id ? transaction : item
        )
      }
      else if (transaction.category === 'switch') {
        state.switchTransactions = state.switchTransactions.map(item =>
          item._id === transaction._id ? transaction : item
        )
      }
      state.orderIdStatus = 'completed'
    })
  }
})

export const {
  switchAddFraction,
  removeSwitchFraction,
  updateSwitchFractionAmount,
  updateSwitchTransactionDate,
  cancelSwitchFraction,
  unlockTransaction,
  updateSwitchFractionFolio,
  updateSwitchApprovalStatus,
  updateSwitchFractionApprovalStatus
} = transactionSlice.actions

export default transactionSlice.reducer