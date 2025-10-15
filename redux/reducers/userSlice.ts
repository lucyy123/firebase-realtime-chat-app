import { onValue } from '@react-native-firebase/database';

import { AuthUserType, UserReducerInitStateType } from '@/utils/types'
import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import { useReanimatedFocusedInput } from 'react-native-keyboard-controller'

const initialState:UserReducerInitStateType = {
  user:null
}


export const userReducer = createSlice({
    name:"userReducer",
    initialState,
    reducers:{
        userExist : (state,action:PayloadAction<AuthUserType>)=>{
            state.user = action.payload
        },
        userNotExist : (state)=>{
            state.user = null;
        },
        changeUserDetails : (state,action:PayloadAction<{type:'bio'|'name', value:string}>)=>{
            const {type,value} = action.payload
            if (state.user) {
                state.user[type] = value;
            }
        }
    }

})

export const {userExist,userNotExist,changeUserDetails} = userReducer.actions