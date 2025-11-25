import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

export default function ReassignDialog({ open, onClose, departments = [], onConfirm }){
  const [dept, setDept] = React.useState('');
  React.useEffect(()=>{ if(departments[0]) setDept(departments[0]._id || ''); },[departments]);
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Reassign Parcel</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <InputLabel>Department</InputLabel>
          <Select value={dept} label="Department" onChange={e=>setDept(e.target.value)}>
            {departments.map(d=> <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={()=>{ onConfirm(dept); onClose(); }}>Reassign</Button>
      </DialogActions>
    </Dialog>
  );
}
