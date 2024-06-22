import { createReducer } from "@reduxjs/toolkit";

const initialstates ={
    isloading:true,
    userdata:{},
    iserror:false
}


export const userauth = createReducer(initialstates , (builder)=>{
    builder.addCase("checkuserloggedpending" , (state)=>{
        state.isloading=true
    })
    builder.addCase("checkuserloggedsuccess" , (state,action)=>{
        state.isloading=false
        state.userdata=action.payload
    })
    builder.addCase("checkuserloggedrejected" , (state,action)=>{
        state.isloading=false
        state.iserror=action.payload
    })
    builder.addCase("logoutpending" , (state)=>{
        state.isloading=true
    })
    builder.addCase("logoutsuccess" , (state,action)=>{
        state.isloading=false
        state.userdata=action.payload
    })
    builder.addCase("logoutrejected" , (state,action)=>{
        state.isloading=false
        state.iserror=true
    })
})