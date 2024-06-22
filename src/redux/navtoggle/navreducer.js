import { createReducer } from "@reduxjs/toolkit";

const initialstates = {
    postionleft:"-100%"
}

export const navtab = createReducer(initialstates , (builder)=>{
    builder.addCase("togglenavtab", (state,action)=>{
        state.postionleft=action.payload
    })
})