import { UserCredRedInitStateType } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserCredRedInitStateType = {
  otpCode: null,
  verificationID: null,
};

export const userCredReducer = createSlice({
  name: "userCredReducer",
  initialState,
  reducers: {
    setUserCred: (state, action:PayloadAction<UserCredRedInitStateType>) => {
      const { otpCode, verificationID } = action.payload;

      state.otpCode = otpCode;
      state.verificationID = verificationID;
    },
  },
});

export const { setUserCred } = userCredReducer.actions;
