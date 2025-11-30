import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { hideNotification } from "../features/notifications/notificationsSlice";

/**
 * GlobalSnackbar component displays global notifications to the user
 * Shows success, error, warning, or info messages
 */
export default function GlobalSnackbar() {
  const dispatch = useDispatch();
  const notification = useSelector(
    (state) =>
      state.notifications || { open: false, message: "", severity: "info" }
  );

  function handleClose() {
    dispatch(hideNotification());
  }

  return (
    <Snackbar
      open={!!notification.open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.severity || "info"}
        sx={{ width: "100%" }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
}
