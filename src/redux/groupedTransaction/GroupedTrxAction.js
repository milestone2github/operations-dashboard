import { createAsyncThunk } from "@reduxjs/toolkit";

export const getGroupedTransactions = createAsyncThunk('groupedTrx/get',
  async (_, {rejectWithValue}) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash`, {
        method: 'GET',
        credentials: 'include'
      })
  
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.error || 'Internal server error')
      }
  
      return resData.data
    } catch (error) {
      console.log('Error fething grouped transactions, ', error.message)
      return rejectWithValue(error.message)
    }
  } 
)

