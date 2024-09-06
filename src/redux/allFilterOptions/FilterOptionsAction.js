import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllAmc = createAsyncThunk('filterOptions/getAllAmc', 
  async (_, {rejectWithValue}) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/amc`)
      const resData = await response.json()
      if(!response.ok) {
        throw new Error(resData.error || "Internal server error while getting amc names")
      }

      return resData.data
    } catch (error) {
      console.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const getAllSchemes = createAsyncThunk('filterOptions/getAllSchemes', 
  async (amc, {rejectWithValue}) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/scheme?amc=${amc}`)
      const resData = await response.json()
      if(!response.ok) {
        throw new Error(resData.error || "Internal server error while getting schemes")
      }

      return resData.data
    } catch (error) {
      console.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const getRMNames = createAsyncThunk('filterOptions/getRMNames', 
  async (_, {rejectWithValue}) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/rm-names`)
      const resData = await response.json()
      if(!response.ok) {
        throw new Error(resData.error || "Internal server error while getting RM names")
      }

      return resData.data
    } catch (error) {
      console.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const getSMNames = createAsyncThunk('filterOptions/getSMNames', 
  async (_, {rejectWithValue}) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/sm-names`)
      const resData = await response.json()
      if(!response.ok) {
        throw new Error(resData.error || "Internal server error while getting SM names")
      }

      return resData.data
    } catch (error) {
      console.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)