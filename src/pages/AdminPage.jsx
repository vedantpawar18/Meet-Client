import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import api from '../api/axios';
import { useSelector } from 'react-redux';

export default function AdminPage(){
  const [msg, setMsg] = React.useState('');
  const user = useSelector(s=>s.auth.user);
  async function seed(){ try{ const res = await api.post('/admin/seed', { createAdmin: true }); setMsg(JSON.stringify(res.data)); }catch(e){ setMsg(e.response?.data?.message || 'Seed failed'); } }
  return (
    <Box>
      <Typography variant="h4">Admin</Typography>
      {user?.role==='admin' ? (
        <Box sx={{mt:2}}><Button variant="contained" onClick={seed}>Run Seed</Button></Box>
      ) : (
        <Box sx={{mt:2}}>You are not authorized to run admin actions.</Box>
      )}
      {msg && <Box sx={{mt:2}}><pre>{msg}</pre></Box>}
    </Box>
  );
}
