import { createAsyncThunk } from "@reduxjs/toolkit";

export const getTransactionsBySession = createAsyncThunk('transactions/sessional', 
  async ({fh, rm}, {rejectWithValue}) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/transactions-of-fhrm?fh=${fh}&rm=${rm}`, {
        method: 'GET',
        credentials: 'include'
      })
  
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.Error || "Internal server error while getting transactions of a family head and RM")
      }
  
      return resData.data
    } catch (error) {
      console.error("Error getting transactions of a family head and RM: ", error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const addFraction = createAsyncThunk('transactions/addFraction', 
  async ({id, fractionAmount, status}, {rejectWithValue}) => {

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/fraction/add/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({fractionAmount, status})
      })
  
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.Error || "Internal server error while adding fraction")
      }
  
      return resData.data
    } catch (error) {
      console.error("Error adding fraction: ", error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const removeFraction = createAsyncThunk('transactions/removeFraction', 
  async ({id, fractionId}, {rejectWithValue}) => {

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/fraction/remove/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({fractionId})
      })
  
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.Error || "Internal server error while removing fraction")
      }
  
      return resData.data
    } catch (error) {
      console.error("Error removing fraction: ", error.message)
      return rejectWithValue(error.message)
    }
  }
)

// ********  NOT REQUIRED ********** 
export const getSystematic = createAsyncThunk('transactions/systematic', 
  async (sessionId, {rejectWithValue}) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/systematic?sessionId=${sessionId}`, {
        method: 'GET',
        credentials: 'include'
      })
  
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.Error || "Internal server error while getting systematic transactions")
      }
  
      return resData.data
    } catch (error) {
      console.error("Error getting systematic transactions: ", error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const getPurchRedemp = createAsyncThunk('transactions/purchRedemp', 
  async (sessionId, {rejectWithValue}) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/purchredemp?sessionId=${sessionId}`, {
        method: 'GET',
        credentials: 'include'
      })
  
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData?.Error || "Internal server error while getting purchase/redemption transactions")
      }
  
      return resData.data
    } catch (error) {
      console.error("Error getting purchase/redemption transactions: ", error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const getSwitch = createAsyncThunk('transactions/switch', 
  async (sessionId, {rejectWithValue}) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/switch?sessionId=${sessionId}`, {
        method: 'GET',
        credentials: 'include'
      })
  
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.Error || "Internal server error while getting switch transactions")
      }
  
      return resData.data
    } catch (error) {
      console.error("Error getting switch transactions: ", error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const addSystematicFraction = createAsyncThunk('transactions/systematic/addFraction', 
  async ({id, fractionAmount, status}, {rejectWithValue}) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/systematic/${id}/fractions`, {
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({fractionAmount, status})
      })
  
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.Error || "Internal server error while adding systematic fraction")
      }
  
      return resData.data
    } catch (error) {
      console.error("Error adding systematic fraction: ", error.message)
      return rejectWithValue(error.message)
    }
  }
)

export const addPurchRedFraction = createAsyncThunk('transactions/systematic/addFraction', 
  async ({id, fractionAmount, status}, {rejectWithValue}) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/systematic/${id}/fractions`, {
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({fractionAmount, status})
      })
  
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.Error || "Internal server error while adding systematic fraction")
      }
  
      return resData.data
    } catch (error) {
      console.error("Error adding systematic fraction: ", error.message)
      return rejectWithValue(error.message)
    }
  }
)