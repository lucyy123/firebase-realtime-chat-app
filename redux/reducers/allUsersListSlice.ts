import { AllUserListRedInitStateType } from "@/utils/types";
import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

const initialState: AllUserListRedInitStateType = {
  users: null,
};

export const allUsersList = createSlice({
  name: "allUsersList",
  initialState,
  reducers: {
    setUsersList: (state, action) => {
      state.users = action.payload;
    },
  },
});

export const { setUsersList } = allUsersList.actions;
