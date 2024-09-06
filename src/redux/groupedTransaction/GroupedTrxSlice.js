import {createSlice} from '@reduxjs/toolkit'
import { getGroupedTransactions, setServiceManager } from './GroupedTrxAction'

const initialState = {
  data: [],
  error: null,
  isLoading: false,
  assignStatus: 'idle' // pending | failed | completed
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

    builder.addCase(setServiceManager.pending, (state) => {
      state.assignStatus = 'pending'
      state.error = null
    })
    builder.addCase(setServiceManager.rejected, (state, action) => {
      state.assignStatus = 'failed'
      state.error = action.payload
    })
    builder.addCase(setServiceManager.fulfilled, (state, action) => {
      state.assignStatus = 'completed'
      state.error = null
      const {serviceManager, _id} = action.payload
      state.data = state.data.map(item => {
        if(item._id === _id) {
          item.serviceManager = serviceManager
        }
        return item
      })
    })
  }
})

export const { } = groupedTrxSlice.actions
export default groupedTrxSlice.reducer