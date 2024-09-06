import { createAsyncThunk } from "@reduxjs/toolkit";

export const getFilteredTransactions = createAsyncThunk('allTransactions/getFilteredTransactions', 
  async ({filters, page, items}, {rejectWithValue}) => {
    const { minDate, maxDate, amcName, schemeName, rmName, smName, type, sort, minAmount, maxAmount, transactionFor, status, approvalStatus } = filters
    
    let query = new URLSearchParams()
    query.append('page', page || 1)
    query.append('items', items || 10)
    query.append('sort', sort)
    if(minDate) {query.append('minDate', minDate)}
    if(maxDate) {query.append('maxDate', maxDate)}
    if(minAmount) {query.append('minAmount', minAmount)}
    if(maxAmount) {query.append('maxAmount', maxAmount)}
    if(amcName) {query.append('amcName', amcName)}
    if(schemeName) {query.append('schemeName', schemeName)}
    if(rmName) {query.append('rmName', rmName)}
    if(type) {query.append('type', type)}
    if(smName) {query.append('smName', smName)}
    if(transactionFor) {query.append('transactionFor', transactionFor)}
    if(status) {query.append('status', status)}
    if(approvalStatus) {query.append('approvalStatus', approvalStatus)}

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/filtered-transactions?${query}`)
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