import { createAsyncThunk } from "@reduxjs/toolkit";

export const getRecoTransactions = createAsyncThunk(
  'reconciliation/getTransactions',
  async ({ filters, page = 1, items = 10 }, { rejectWithValue }) => {
    const {
      minDate,
      maxDate,
      minAmount,
      maxAmount,
      schemeName,
      amcName,
      rmName,
      type,
      sort
    } = filters;

    let query = new URLSearchParams();
    
    // Add pagination params
    query.append('page', page);
    query.append('items', items);
    
    // Add sorting if provided
    if (sort) query.append('sort', sort);

    // Add filters to the query string if provided
    if (minAmount) query.append('minAmount', minAmount);
    if (maxAmount) query.append('maxAmount', maxAmount);
    if (schemeName) query.append('schemeName', schemeName);
    if (amcName) query.append('amcName', amcName);
    if (rmName) query.append('rmName', rmName);
    if (type) query.append('type', type);
    if (minDate) query.append('minDate', minDate);
    if (maxDate) query.append('maxDate', maxDate);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ops-dash/reconciliation?${query.toString()}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
  
      const resData = await response.json();
  
      if (!response.ok) {
        throw new Error(resData.error || "Internal server error while getting reconciliation transactions");
      }
  
      return resData.data;
    } catch (error) {
      console.error("Error getting reconciliation transactions: ", error.message);
      return rejectWithValue(error.message);
    }
  }
);
