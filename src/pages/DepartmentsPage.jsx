import React from 'react';
import { Box, Typography, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../features/departments/departmentsSlice';
import { showNotification } from '../features/notifications/notificationsSlice';

export default function DepartmentsPage(){
  const dispatch = useDispatch();
  const { list } = useSelector(s=>s.departments);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  React.useEffect(()=>{ dispatch(fetchDepartments()); },[]);
  async function add(){ if(!name) return; const res = await dispatch(createDepartment({ name, description })); if(res.error) dispatch(showNotification({ message: res.payload?.message||'Failed', severity: 'error' })); else { setName(''); setDescription(''); dispatch(showNotification({ message: 'Added', severity: 'success' })); } }
  async function doEdit(dep){
    const newName = window.prompt('Name', dep.name);
    if(newName==null) return;
    const newDesc = window.prompt('Description', dep.description || '');
    const res = await dispatch(updateDepartment({ id: dep._id, payload: { name: newName, description: newDesc } }));
    if(res.error) dispatch(showNotification({ message: res.payload?.message || 'Update failed', severity: 'error' })); else dispatch(showNotification({ message: 'Updated', severity: 'success' }));
  }
  async function doDelete(id){ if(!window.confirm('Delete department?')) return; const res = await dispatch(deleteDepartment(id)); if(res.error) dispatch(showNotification({ message: res.payload?.message||'Failed', severity: 'error' })); else dispatch(showNotification({ message: 'Deleted', severity: 'success' })); }
  const user = useSelector(s=>s.auth.user);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Departments</Typography>
      {user?.role==='admin' && (
        <Paper sx={{p:2,mb:2}}>
          <TextField label="Name" value={name} onChange={e=>setName(e.target.value)} sx={{mr:1}} />
          <TextField label="Description" value={description} onChange={e=>setDescription(e.target.value)} sx={{mr:1}} />
          <Button variant="contained" onClick={add}>Add</Button>
        </Paper>
      )}
      <Paper>
        <Table>
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Description</TableCell><TableCell>Action</TableCell></TableRow></TableHead>
          <TableBody>{list.map(d=> (<TableRow key={d._id}><TableCell>{d.name}</TableCell><TableCell>{d.description}</TableCell><TableCell><Button onClick={()=>doEdit(d)}>Edit</Button><Button color="error" onClick={()=>doDelete(d._id)}>Delete</Button></TableCell></TableRow>))}</TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
