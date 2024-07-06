import { createSlice } from "@reduxjs/toolkit"
import { getAllAmc, getAllSchemes, getRMNames } from "./FilterOptionsAction"

const initialState = {
  amcList: [''],
  schemesList: [''],
  rmNameList: [''],
  typeList: [
    "",
    "SIP",
    "STP",
    "SWP",
    "Purchase",
    "Redemption",
    "Switch"
  ],
  status: 'idle', // pending | failed | completed
  error: null
}

const filterOptionsSlice = createSlice({
  name: 'allFilterOptions',
  initialState,
  reducers: {
    resetSchemeList: (state) => {
      state.schemesList = ['']
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getAllAmc.pending, (state) => {
      state.status = 'pending'
      state.error = null
    })
    builder.addCase(getAllAmc.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.payload
    })
    builder.addCase(getAllAmc.fulfilled, (state, action) => {
      state.status = 'completed'
      state.amcList = ["", ...action.payload]
    })


    builder.addCase(getAllSchemes.pending, (state) => {
      state.status = 'pending'
      state.error = null
    })
    builder.addCase(getAllSchemes.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.payload
    })
    builder.addCase(getAllSchemes.fulfilled, (state, action) => {
      state.status = 'completed'
      state.schemesList = ["", ...action.payload]
    })


    builder.addCase(getRMNames.pending, (state) => {
      state.status = 'pending'
      state.error = null
    })
    builder.addCase(getRMNames.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.payload
    })
    builder.addCase(getRMNames.fulfilled, (state, action) => {
      state.status = 'completed'
      state.rmNameList = ["", ...action.payload]
    })
  }
})

export const { resetSchemeList } = filterOptionsSlice.actions
export default filterOptionsSlice.reducer