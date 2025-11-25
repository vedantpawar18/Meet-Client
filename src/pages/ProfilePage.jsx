import React from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { showNotification } from '../features/notifications/notificationsSlice';

export default function ProfilePage(){
  const user = useSelector(s => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(()=>{
    if(!user){
      navigate('/login');
      return;
    }
    setName(user.name || '');
    setEmail(user.email || '');
    setRole(user.role || '');
  },[user, navigate]);

  async function handleSave(){
    if(!name.trim() || !email.trim()){
      dispatch(showNotification({ message: 'Name and email are required', severity: 'error' }));
      return;
    }
    
    setLoading(true);
    try {
      await api.put(`/users/${user._id}`, { name: name.trim(), email: email.trim() });
      dispatch(showNotification({ message: 'Profile updated successfully', severity: 'success' }));
      setIsEditing(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Update failed';
      dispatch(showNotification({ message: msg, severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }

  function handleCancel(){
    setName(user.name || '');
    setEmail(user.email || '');
    setIsEditing(false);
  }

  if(!user) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>My Profile</Typography>
      
      <Paper sx={{p:3, maxWidth:600}}>
        {isEditing ? (
          <>
            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              sx={{mb:2}}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              sx={{mb:2}}
            />
            <TextField
              label="Role"
              fullWidth
              value={role}
              disabled
              sx={{mb:2}}
              helperText="Role cannot be changed"
            />
            <Box sx={{display:'flex', gap:2}}>
              <Button variant="contained" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{mb:2}}>
              <strong>Name:</strong> {user.name}
            </Typography>
            <Typography variant="body1" sx={{mb:2}}>
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography variant="body1" sx={{mb:3}}>
              <strong>Role:</strong> {user.role}
            </Typography>
            <Button variant="contained" onClick={()=>setIsEditing(true)}>
              Edit Profile
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
