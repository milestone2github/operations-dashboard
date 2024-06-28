import { createSlice } from "@reduxjs/toolkit"
import { addFraction, generateLink, getTransactionsBySession, removeFraction, saveFractions } from "./TransactionsAction"

const initialState = {
  systematicTransactions: [],
  purchRedempTransactions: [],
  switchTransactions: [],
  isLoading: false,
  error: null
}

const transactionSlice = createSlice({
  name: 'sessionalTransactions',
  initialState,
  reducers: {
    // systematicAddFraction: (state, action) => {
    //   const { index, amount, status } = action.payload
    //   if (index <= state.systematicTransactions.length - 1 && index >= 0) {
    //     let updated = state.systematicTransactions
    //     updated[index].transactionFractions.push({ fractionAmount: amount, status })
    //     state.systematicTransactions = updated
    //   }
    // },
    // removeSystematicFraction: (state, action) => {
    //   const { id, fractionId } = action.payload
    //   let updated = state.systematicTransactions

    //   for (let i = 0; i < updated.length; i++) {
    //     const element = updated[i];
    //     if(element._id === id) {
    //       for (let j = 0; j < element.transactionFractions.length; j++) {
    //         let fraction = element.transactionFractions[j]
    //         if(fraction._id === fractionId){
    //           updated[i].transactionFractions.splice(j, 1)
    //           state.systematicTransactions = updated
    //           break
    //         }
    //       }
    //       break
    //     }
    //   }
    // },
    // updateSystematicFractionAmount: (state, action) => {
    //   const { index, fracIndex, amount } = action.payload
    //   if (index <= state.systematicTransactions.length - 1 && index >= 0) {
    //     let updated = state.systematicTransactions
    //     updated[index].transactionFractions[fracIndex].fractionAmount = amount
    //     state.systematicTransactions = updated
    //   }
    // },

    // purchRedAddFraction: (state, action) => {
    //   const { index, amount, status } = action.payload
    //   if (index <= state.purchRedempTransactions.length - 1 && index >= 0) {
    //     let updated = state.purchRedempTransactions
    //     updated[index].transactionFractions.push({ fractionAmount: amount, status })
    //     state.purchRedempTransactions = updated
    //   }
    // },

    // removePurchRedFraction: (state, action) => {
    //   const { id, fractionId } = action.payload
    //   let updated = state.purchRedempTransactions

    //   for (let i = 0; i < updated.length; i++) {
    //     const element = updated[i];
    //     if(element._id === id) {
    //       for (let j = 0; j < element.transactionFractions.length; j++) {
    //         let fraction = element.transactionFractions[j]
    //         if(fraction._id === fractionId){
    //           updated[i].transactionFractions.splice(j, 1)
    //           state.purchRedempTransactions = updated
    //           break
    //         }
    //       }
    //       break
    //     }
    //   }
    // },

    // updatePurchRedFractionAmount: (state, action) => {
    //   const { index, fracIndex, amount } = action.payload
    //   if (index <= state.purchRedempTransactions.length - 1 && index >= 0) {
    //     let updated = state.purchRedempTransactions
    //     updated[index].transactionFractions[fracIndex].fractionAmount = amount
    //     state.purchRedempTransactions = updated
    //   }
    // },

    switchAddFraction: (state, action) => {
      const { index, amount, status } = action.payload
      if (index <= state.switchTransactions.length - 1 && index >= 0) {
        let updated = state.switchTransactions
        updated[index].transactionFractions.push({ fractionAmount: amount, status })
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
    updateSwitchFractionAmount: (state, action) => {
      const { index, fracIndex, amount } = action.payload
      if (index <= state.switchTransactions.length - 1 && index >= 0) {
        let updated = state.switchTransactions
        updated[index].transactionFractions[fracIndex].fractionAmount = amount
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


    // builder.addCase(addFraction.pending, (state) => {
    //   state.error = null
    //   state.isLoading = true
    // })
    // builder.addCase(addFraction.rejected, (state, action) => {
    //   state.error = action.payload
    //   state.isLoading = false
    // })
    // builder.addCase(addFraction.fulfilled, (state, action) => {
    //   state.isLoading = false
    //   let transaction = action.payload
    //   if (transaction.category === 'systematic') {
    //     state.systematicTransactions = state.systematicTransactions.map(item =>
    //       item._id === transaction._id ? transaction : item
    //     )
    //   }
    //   else if (transaction.category === 'purchredemp') {
    //     state.purchRedempTransactions = state.purchRedempTransactions.map(item =>
    //       item._id === transaction._id ? transaction : item
    //     )
    //   }
    //   else if (transaction.category === 'switch') {
    //     state.switchTransactions = state.switchTransactions.map(item =>
    //       item._id === transaction._id ? transaction : item
    //     )
    //   }
    // })


    // builder.addCase(removeFraction.pending, (state) => {
    //   state.error = null
    //   state.isLoading = true
    // })
    // builder.addCase(removeFraction.rejected, (state, action) => {
    //   state.error = action.payload
    //   state.isLoading = false
    // })
    // builder.addCase(removeFraction.fulfilled, (state, action) => {
    //   state.isLoading = false
    //   let transaction = action.payload
    //   if (transaction.category === 'systematic') {
    //     state.systematicTransactions = state.systematicTransactions.map(item =>
    //       item._id === transaction._id ? transaction : item
    //     )
    //   }
    //   else if (transaction.category === 'purchredemp') {
    //     state.purchRedempTransactions = state.purchRedempTransactions.map(item =>
    //       item._id === transaction._id ? transaction : item
    //     )
    //   }
    //   else if (transaction.category === 'switch') {
    //     state.switchTransactions = state.switchTransactions.map(item =>
    //       item._id === transaction._id ? transaction : item
    //     )
    //   }
    // })


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
      state.isLoading = true
    })
    builder.addCase(generateLink.rejected, (state, action) => {
      state.error = action.payload
      state.isLoading = false
    })
    builder.addCase(generateLink.fulfilled, (state, action) => {
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
  }
})

export const {
  systematicAddFraction,
  removeSystematicFraction,
  updateSystematicFractionAmount,
  purchRedAddFraction,
  removePurchRedFraction,
  updatePurchRedFractionAmount,
  switchAddFraction,
  removeSwitchFraction,
  updateSwitchFractionAmount,
  updateSwitchTransactionDate,
  cancelSwitchFraction,
  unlockTransaction
} = transactionSlice.actions

export default transactionSlice.reducer