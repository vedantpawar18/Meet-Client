import { createSlice } from "@reduxjs/toolkit";

// Initial state for notifications
const initialState = {
  open: false,
  message: "",
  severity: "info",
};

// Notifications slice manages global snackbar notifications
const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Show a notification with the given message and severity
    showNotification(state, action) {
      state.open = true;
      state.message = action.payload?.message || "";
      state.severity = action.payload?.severity || "info";
    },
    // Hide the current notification
    hideNotification(state) {
      state.open = false;
      state.message = "";
    },
  },
});

export const { showNotification, hideNotification } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
