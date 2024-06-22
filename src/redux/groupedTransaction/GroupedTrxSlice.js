import {createSlice} from '@reduxjs/toolkit'
import { getGroupedTransactions } from './GroupedTrxAction'

const initialState = {
  data: [],
  error: null,
  isLoading: false
}
const groupedTrxSlice = createSlice({
  name: 'groupedTransactions',
  initialState,
  reducers: {
    resetGroupedTransanction: () => initialState
  },
  extraReducers(builder) {
    builder.addCase(getGroupedTransactions.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getGroupedTransactions.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload
    })
    builder.addCase(getGroupedTransactions.fulfilled, (state, action) => {
      state.isLoading = false
      state.error = null
      state.data = action.payload
    })
  }
})

export const { } = groupedTrxSlice.actions
export default groupedTrxSlice.reducer