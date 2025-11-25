import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, IconButton } from '@mui/material';
import { useDispatch } from 'react-redux';
import { getParcelById, reassignParcel, markProcessed, downloadRawXml } from '../features/parcels/parcelsExtra';
import { deleteParcel } from '../features/parcels/parcelsSlice';
import { showNotification } from '../features/notifications/notificationsSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import ReassignDialog from '../components/ReassignDialog';
import api from '../api/axios';

export default function ParcelDetailPage(){
  const { id } = useParams();
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [parcel, setParcel] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [openReassign, setOpenReassign] = React.useState(false);
  const [departments, setDepartments] = React.useState([]);

  React.useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const res = await api.get(`/parcels/${id}`);
        if(mounted) setParcel(res.data);
        const dres = await api.get('/departments');
        if(mounted) setDepartments(dres.data || []);
      }catch(e){ console.error(e); }
      if(mounted) setLoading(false);
    })();
    return ()=> mounted = false;
  },[id]);

  async function handleReassign(deptId){
    try{ const res = await dispatch(reassignParcel({ id, departmentId: deptId })); if(!res.error) setParcel(res.payload); }catch(e){}
  }
  async function handleMarkProcessed(){ const res = await dispatch(markProcessed(id)); if(!res.error) setParcel(res.payload); }
  async function handleDownload(){ const res = await dispatch(downloadRawXml(id)); if(res.payload && res.payload.blob){ const url = window.URL.createObjectURL(res.payload.blob); const a = document.createElement('a'); a.href = url; a.download = `${parcel.trackingId || id}.xml`; a.click(); window.URL.revokeObjectURL(url); } }

  if(loading) return <div>Loading...</div>;
  if(!parcel) return <div>Parcel not found</div>;

  return (
    <Box>
      <Typography variant="h4">Parcel {parcel.trackingId}</Typography>
      <Paper sx={{p:2,mt:2}}>
        <Typography><strong>Weight:</strong> {parcel.weightKg}</Typography>
        <Typography><strong>Value:</strong> {parcel.valueEur}</Typography>
        <Typography><strong>Destination:</strong> {parcel.destination}</Typography>
        <Typography><strong>Department:</strong> {parcel.assignedDepartment?.name || parcel.assignedDepartment || '-'}</Typography>
        <Typography><strong>Insurance:</strong> {parcel.insuranceApproval?.status}</Typography>
        <Box sx={{mt:2,display:'flex',gap:2}}>
          <Button variant="contained" onClick={()=>setOpenReassign(true)}>Reassign</Button>
          <Button variant="outlined" onClick={handleMarkProcessed}>Mark Processed</Button>
          <Button onClick={handleDownload}>Download Raw XML</Button>
          <IconButton color="error" onClick={async ()=>{
            if(!window.confirm('Delete this parcel? This action cannot be undone.')) return;
            const res = await dispatch(deleteParcel(id));
            if(res.error){ dispatch(showNotification({ message: res.payload?.message || 'Delete failed', severity: 'error' })); return; }
            nav('/parcels');
          }}><DeleteIcon/></IconButton>
        </Box>
      </Paper>

      <ReassignDialog open={openReassign} onClose={()=>setOpenReassign(false)} departments={departments} onConfirm={handleReassign} />
    </Box>
  );
}
