import { createAsyncThunk } from "@reduxjs/toolkit";

export const getNfoTransactions = createAsyncThunk('nfo/getNfoTransactions', 
  async ({page, items}, {rejectWithValue}) => {
    let query = new URLSearchParams()
    query.append('page', page || 1)
    query.append('items', items || 10)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/nfo-transactions?${query}`)
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.error || "Internal server error while fetching transactions!")
      }
  
      return resData.data 
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)