import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import parcelsReducer from "./features/parcels/parcelsSlice";
import departmentsReducer from "./features/departments/departmentsSlice";
import rulesReducer from "./features/rules/rulesSlice";
import usersReducer from "./features/users/usersSlice";
import notificationsReducer from "./features/notifications/notificationsSlice";
import loadingReducer, {
  increment,
  decrement,
} from "./features/loading/loadingSlice";

// Middleware to automatically track async thunk lifecycle actions
// This increments the loading count when an async operation starts (pending)
// and decrements it when it completes (fulfilled or rejected)
const loadingMiddleware = (storeAPI) => (next) => (action) => {
  try {
    if (action && typeof action.type === "string") {
      // Check if this is a pending async thunk action
      if (action.type.endsWith("/pending")) {
        storeAPI.dispatch(increment());
      }
      // Check if this is a completed async thunk action (success or failure)
      else if (
        action.type.endsWith("/fulfilled") ||
        action.type.endsWith("/rejected")
      ) {
        storeAPI.dispatch(decrement());
      }
    }
  } catch (error) {
    // Silently ignore errors in middleware to prevent breaking the app
  }
  return next(action);
};

// Configure Redux store with all reducers and middleware
const store = configureStore({
  reducer: {
    auth: authReducer,
    parcels: parcelsReducer,
    departments: departmentsReducer,
    rules: rulesReducer,
    users: usersReducer,
    notifications: notificationsReducer,
    loading: loadingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loadingMiddleware),
});

export default store;
