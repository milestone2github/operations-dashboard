import { createAsyncThunk } from "@reduxjs/toolkit";

export const getGroupedTransactions = createAsyncThunk('groupedTrx/get',
  async ({smFilter, searchBy, searchKey}, {rejectWithValue}) => {
    let searchParams = new URLSearchParams()
    if(smFilter){searchParams.append('smFilter', smFilter)}
    if(searchBy){searchParams.append('searchBy', searchBy)}
    if(searchKey){searchParams.append('searchKey', searchKey)}

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/group-by-fhrm?${searchParams}`, {
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

export const setServiceManager = createAsyncThunk('groupedTrx/setServiceManager',
  async ({_id, familyHead, relationshipManager, serviceManager}, {rejectWithValue}) => {
    let params = new URLSearchParams()
    params.append('sm', serviceManager)
    if(familyHead) {params.append('fh', familyHead)}
    if(relationshipManager) {params.append('rm', relationshipManager)}

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ops-dash/service-manager?${params.toString()}`, {
        method: 'PATCH',
        credentials: 'include'
      })
  
      const resData = await response.json()
  
      if(!response.ok) {
        throw new Error(resData.error || 'Internal server error')
      }
  
      return {...resData.data, _id}
    } catch (error) {
      console.log('Error setting service manager, ', error.message)
      return rejectWithValue(error.message)
    }
  } 
)

