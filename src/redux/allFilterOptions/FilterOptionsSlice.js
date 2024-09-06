import { createSlice } from "@reduxjs/toolkit"
import { getAllAmc, getAllSchemes, getRMNames, getSMNames } from "./FilterOptionsAction"
import { approvalStatusList, transactionStatusList } from "../../utils/lists"

const initialState = {
  amcList: [''],
  schemesList: [''],
  rmNameList: [''],
  smNameList: [''],
  typeList: [
    "",
    "SIP",
    "STP",
    "SWP",
    "Purchase",
    "Redemption",
    "Switch"
  ],
  statusList: transactionStatusList,
  approvalStatusList,
  transactionForList: ["", 'Registration', 'Pause', 'Cancellation'],
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

    builder.addCase(getSMNames.pending, (state) => {
      state.status = 'pending'
      state.error = null
    })
    builder.addCase(getSMNames.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.payload
    })
    builder.addCase(getSMNames.fulfilled, (state, action) => {
      state.status = 'completed'
      state.smNameList = ["", ...action.payload]
    })
  }
})

export const { resetSchemeList } = filterOptionsSlice.actions
export default filterOptionsSlice.reducer