import { createAsyncThunk } from "@reduxjs/toolkit";

export const getSavedFilters = createAsyncThunk('savedFilters/get',
  async (_, {rejectWithValue}) => {

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/saved-filters`, {
        method: 'GET',
        credentials: 'include'
      })
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.error || "Internal server error while fetching saved filters!")
      }
  
      return resData.data 
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addSavedFilters = createAsyncThunk('savedFilters/add',
  async (filters, {rejectWithValue}) => {
    const body = {}
    if(filters.at) {body.at = filters.at}
    if(filters.reco) {body.reco = filters.reco}

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/saved-filters`, {
        method: 'PUT',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.error || "Internal server error while adding saved filters!")
      }
  
      return resData.data 
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateActiveSavedFilters = createAsyncThunk('savedFilters/updateActive',
  async (filterIndexes, {rejectWithValue}) => {
    const queryParams = new URLSearchParams()
    if(filterIndexes.atIdx?.toString()) {queryParams.append('atIdx', filterIndexes.atIdx)}
    if(filterIndexes.recoIdx?.toString()) {queryParams.append('recoIdx', filterIndexes.recoIdx)}
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/saved-filters/active?${queryParams.toString()}`, {
        method: 'PATCH',
        credentials: 'include'
      })
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.error || "Internal server error while updating active saved filters!")
      }
  
      return resData.data 
    } catch (error) {
      console.log(error)
      return rejectWithValue(error.message)
    }
  }
)