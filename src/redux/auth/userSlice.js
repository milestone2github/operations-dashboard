import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: 'user',
  initialState: {
    isLoading: false ,//true
    isLoggedIn: false, //make it false while deployment
    userData: null, //null
  },
  reducers: {
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action) => {
      state.userData = action.payload
    }
  }
})

export const { setLoggedIn, setLoading, setUser } = userSlice.actions;

export default userSlice.reducer;