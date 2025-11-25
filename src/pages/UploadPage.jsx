import React from 'react';
import { Box, Typography, Button, Paper, LinearProgress } from '@mui/material';
import { useDispatch } from 'react-redux';
import { uploadParcelsXml } from '../features/parcels/parcelsSlice';

export default function UploadPage(){
  const [file, setFile] = React.useState(null);
  const [status, setStatus] = React.useState(null);
  const dispatch = useDispatch();
  async function submit(e){ e.preventDefault(); if(!file) return setStatus({ type:'error', text:'Select XML file' }); setStatus({ type:'loading' }); const res = await dispatch(uploadParcelsXml(file)); if(res.error) setStatus({ type:'error', text: res.payload?.message || 'Upload failed' }); else setStatus({ type:'success', text:`Created ${res.payload.created || 0} parcels` }); }
  return (
    <Paper sx={{p:2}}>
      <Typography variant="h5">Upload Container XML</Typography>
      <form onSubmit={submit}>
        <input type="file" accept=".xml" onChange={e=>setFile(e.target.files[0])} />
        <Box sx={{mt:2}}><Button type="submit" variant="contained">Upload</Button></Box>
      </form>
      {status?.type==='loading' && <LinearProgress sx={{mt:2}} />}
      {status?.text && <Box sx={{mt:2}}>{status.text}</Box>}
    </Paper>
  );
}
