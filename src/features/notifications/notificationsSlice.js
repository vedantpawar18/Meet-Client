import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  message: '',
  severity: 'info',
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    showNotification(state, action) {
      state.open = true;
      state.message = action.payload?.message || '';
      state.severity = action.payload?.severity || 'info';
    },
    hideNotification(state) {
      state.open = false;
      state.message = '';
    },
  },
});

export const { showNotification, hideNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
