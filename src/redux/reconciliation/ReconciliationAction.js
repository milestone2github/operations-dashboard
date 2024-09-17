import { createAsyncThunk } from "@reduxjs/toolkit";

export const getRecoTransactions = createAsyncThunk('reconciliation/getTransactions',
  async (data, {rejectWithValue}) => {
    let params = new URLSearchParams() 
    // params.append('smFilter', smFilter)
    // if(fh) {params.append('fh', fh)}

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/reconciliation?${params.toString()}`, {
        method: 'GET',
        credentials: 'include'
      })
  
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.error || "Internal server error while getting reconciliation transactions")
      }
  
      return resData.data
    } catch (error) {
      console.error("Error getting reconciliation transactions: ", error.message)
      return rejectWithValue(error.message)
    }
  }
)