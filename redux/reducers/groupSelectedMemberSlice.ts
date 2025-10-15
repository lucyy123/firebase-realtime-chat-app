import { AuthUserType, GroupSelectedMemberInitType } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
const initialState: GroupSelectedMemberInitType = {
  members: [],
};

export const groupSelectedMemberReducer = createSlice({
  name: "groupSelectedMemberReducer",
  initialState,
  reducers: {
    AddMember: (state, action: PayloadAction<AuthUserType>) => {
      const newUser = action.payload;
      console.log('newUser in reducer:', newUser)
      const exists = state.members?.some(m => m.uid === newUser.uid);
      if (!exists) {
        state.members?.push(newUser);
    }
    console.log('state.members:', state.members)
    },

  },
});

export const { AddMember } = groupSelectedMemberReducer.actions;
