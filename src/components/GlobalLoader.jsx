import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';

export default function GlobalLoader(){
  const count = useSelector(s => s.loading?.count || 0);
  if(!count) return null;
  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' }}>
      <CircularProgress size={64} />
    </Box>
  );
}
