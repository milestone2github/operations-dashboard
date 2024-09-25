import { createSlice } from "@reduxjs/toolkit"
import { addSavedFilters, getSavedFilters } from "./SavedFiltersAction"

const initialState = {
  all: {
    filters: [],
    active: -1
  },
  reco: {
    filters: [],
    active: -1
  },
  getStatus: 'idle', // pending | failed | completed
  addStatus: 'idle', // pending | failed | completed
  error: null
}

const savedFiltersSlice = createSlice({
  name: 'savedFilters',
  initialState,
  reducers: {
    setActiveAll : (state, action) => {
      state.all.active = action.payload
    },
    setActiveReco : (state, action) => {
      state.reco.active = action.payload
    },
    resetAddStatus: (state) => {state.addStatus = 'idle'},
    resetGetStatus: (state) => {state.getStatus = 'idle'}
  },
  extraReducers: (builder) => {
    builder.addCase(getSavedFilters.pending, (state) => {
      state.getStatus = 'pending'
      state.error = null
    })
    builder.addCase(getSavedFilters.rejected, (state, action) => {
      state.getStatus = 'failed'
      state.error = action.payload
    })
    builder.addCase(getSavedFilters.fulfilled, (state, action) => {
      state.getStatus = 'completed'
      const {allTrxFilters, reconciliationFilters} = action.payload
      state.all.filters = allTrxFilters.values
      state.all.active = allTrxFilters.activeIdx
      state.reco.filters = reconciliationFilters.values
      state.reco.active = reconciliationFilters.activeIdx
    })

    builder.addCase(addSavedFilters.pending, (state) => {
      state.addStatus = 'pending'
      state.error = null
    })
    builder.addCase(addSavedFilters.rejected, (state, action) => {
      state.addStatus = 'failed'
      state.error = action.payload
    })
    builder.addCase(addSavedFilters.fulfilled, (state, action) => {
      state.addStatus = 'completed'
      const {allTrxFilters, reconciliationFilters} = action.payload
      state.all.filters = allTrxFilters.values
      state.all.active = allTrxFilters.activeIdx
      state.reco.filters = reconciliationFilters.values
      state.reco.active = reconciliationFilters.activeIdx
    })
  }
})

export const {setActiveAll, setActiveReco, resetAddStatus, resetGetStatus} = savedFiltersSlice.actions
export default savedFiltersSlice.reducer