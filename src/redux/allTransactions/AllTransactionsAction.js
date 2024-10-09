import { createAsyncThunk } from "@reduxjs/toolkit";

export const getFilteredTransactions = createAsyncThunk('allTransactions/getFilteredTransactions', 
  async ({filters, page, items, signal}, {rejectWithValue}) => {
    let query = new URLSearchParams()
    query.append('page', page || 1)
    query.append('items', items || 10)
    if(filters.sort) {query.append('sort', filters.sort)}

    for(const [key, value] of Object.entries(filters)) {
      if(Array.isArray(value) && key !== 'sort') {
        value.forEach(item => query.append(key, item))
      }
      else if(value && key !== 'sort') {query.append(key, value)}
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/filtered-transactions?${query}`, {signal})
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.error || "Internal server error while fetching transactions!")
      }
  
      return resData.data 
    } catch (error) {
      if(error.name === 'AbortError') {
        return
      }
      return rejectWithValue(error.message)
    }
  }
)