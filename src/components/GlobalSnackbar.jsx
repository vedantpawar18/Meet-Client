import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification } from '../features/notifications/notificationsSlice';

export default function GlobalSnackbar(){
  const dispatch = useDispatch();
  const notif = useSelector(s => s.notifications || { open:false, message:'', severity:'info' });

  function handleClose(){ dispatch(hideNotification()); }

  return (
    <Snackbar open={!!notif.open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert onClose={handleClose} severity={notif.severity || 'info'} sx={{ width: '100%' }}>
        {notif.message}
      </Alert>
    </Snackbar>
  );
}
