import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/userSlice";
import { userCurrentLocationReducer } from "./reducers/locationSlice";
import { allUsersList } from "./reducers/allUsersListSlice";
import { userCredReducer } from "./reducers/userCredSlice";
import { notificationSlice } from "./reducers/notificationSlice";
import { groupSearchQueryReducer } from "./reducers/groupSearchQuery";
import { groupSelectedMemberReducer } from "./reducers/groupSelectedMemberSlice";



export const store = configureStore({
    reducer:{
        [userReducer.name]:userReducer.reducer,
        [userCurrentLocationReducer.name]:userCurrentLocationReducer.reducer,
        [allUsersList.name]:allUsersList.reducer,
        [userCredReducer.name]:userCredReducer.reducer,
        [notificationSlice.name]:notificationSlice.reducer,
        [groupSearchQueryReducer.name]:groupSearchQueryReducer.reducer,
        [groupSelectedMemberReducer.name]:groupSelectedMemberReducer.reducer,
    }
})

