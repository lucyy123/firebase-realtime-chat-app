import { update } from '@react-native-firebase/database';
import { GroupSearchQueryRedInitState } from './../../utils/types';
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState : GroupSearchQueryRedInitState = {

searchedQuery:'',
selectedMember :0
}

export const groupSearchQueryReducer = createSlice({
    name: "groupSearchQuery",
    initialState,
    reducers: {
        setGroupSearchQuery: (state, action) => {
            state.searchedQuery = action.payload;
        },

        updateSelectedMemberCount :(state,action)=>{
            const count =Number(action.payload)
            state.selectedMember= count
        }
    },  
})

export const { setGroupSearchQuery,updateSelectedMemberCount } = groupSearchQueryReducer.actions; 