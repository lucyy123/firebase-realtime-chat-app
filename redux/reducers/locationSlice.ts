import { AddressType, LocationType, UserLocationRedInitalStateType } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState:UserLocationRedInitalStateType = {
    location: null,
    address: null
}


export const userCurrentLocationReducer = createSlice({
    name:'userCurrentLocationReducer',
    initialState,

    reducers:{

        fetchAndUpdateUserCurrentLocation : (state,action:PayloadAction<LocationType>)=>{
            state.location = action.payload
        },

        userCurrentAddress : (state,action:PayloadAction<AddressType>) =>{
            state.address = action.payload

        }
       
    }
})

export const {fetchAndUpdateUserCurrentLocation,userCurrentAddress } = userCurrentLocationReducer.actions