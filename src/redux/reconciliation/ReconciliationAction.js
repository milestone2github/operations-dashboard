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
      sort,
      searchBy,
      searchKey
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
    if (searchBy) query.append('searchBy', searchBy)
    if (searchKey) query.append('searchKey', searchKey)

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

export const reconcileTransaction = createAsyncThunk(
  'reconciliation/reconcile',
  async ({ trxId, fractionId, updates }, { rejectWithValue }) => {
    if(fractionId) {
      updates = {fractionId, ...updates};
    }

    try {
      // make update request 
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ops-dash/reconciliation/${trxId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(updates),
        }
      );

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Internal server error while reconciliation");
      }

      return resData.data;
    } catch (error) {
      console.error("Error doing reconciliation: ", error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const approveReconciliation = createAsyncThunk(
  'reconciliation/approve',
  async ({ trxId, fractionId, approve, status }, { rejectWithValue }) => {
    let updates = {approve, status}
    if(fractionId) {
      updates.fractionId = fractionId;
    }

    try {
      // make update request 
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ops-dash/reconciliation/${trxId}/approve`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(updates),
        }
      );

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Internal server error while approving reconciliation");
      }

      return resData.data;
    } catch (error) {
      console.error("Error doing approving reconciliation: ", error.message);
      return rejectWithValue(error.message);
    }
  }
);
