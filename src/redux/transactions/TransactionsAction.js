import { createAsyncThunk } from "@reduxjs/toolkit";

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