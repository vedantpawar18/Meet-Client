import React from 'react';
import { Container, Box, TextField, Button, Alert, Paper, Typography, Link, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage(){
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(s => s.auth);

  const [mode, setMode] = React.useState('login'); // 'login' | 'register'
  const [loading, setLoading] = React.useState(false);
  const [globalMsg, setGlobalMsg] = React.useState(null);

  // login fields
  const [email, setEmail] = React.useState('admin@example.com');
  const [password, setPassword] = React.useState('password');

  // register fields
  const [name, setName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [role, setRole] = React.useState('operator');

  React.useEffect(()=>{
    if (auth.token) navigate('/');
  }, [auth.token, navigate]);

  async function handleLogin(e){
    e.preventDefault();
    setGlobalMsg(null);
    setLoading(true);
    try {
      const res = await dispatch(login({ email, password }));
      setLoading(false);
      if (res.error) {
        setGlobalMsg({ type: 'error', text: res.payload?.message || res.error.message || 'Login failed' });
        return;
      }
      // login thunk sets token -> effect will navigate
    } catch (err) {
      setLoading(false);
      setGlobalMsg({ type: 'error', text: err.message || 'Login failed' });
    }
  }

  async function handleRegister(e){
    e.preventDefault();
    setGlobalMsg(null);

    // basic client-side validation
    if (!name.trim() || !regEmail.trim() || !regPassword) {
      setGlobalMsg({ type: 'error', text: 'Name, email and password are required' });
      return;
    }

    setLoading(true);
    try {
      // call register endpoint with role only
      const payload = { name: name.trim(), email: regEmail.trim(), password: regPassword, role };
      await api.post('/auth/register', payload);
      // on success, auto-login the user
      const res = await dispatch(login({ email: regEmail.trim(), password: regPassword }));
      setLoading(false);
      if (res.error) {
        // registered but login failed for some reason
        setGlobalMsg({ type: 'success', text: 'Registered successfully — please login' });
        setMode('login');
      } else {
        // login success -> navigate by effect
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setGlobalMsg({ type: 'error', text: msg });
    }
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {mode === 'login' ? 'Login' : 'Register'}
        </Typography>

        {globalMsg && (
          <Alert severity={globalMsg.type === 'error' ? 'error' : 'success'} sx={{ mb: 2 }}>
            {globalMsg.text}
          </Alert>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              fullWidth
              sx={{ mb: 2 }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              sx={{ mb: 2 }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </Button>
              <Typography variant="body2">
                No account?{' '}
                <Link component="button" onClick={() => { setMode('register'); setGlobalMsg(null); }}>
                  Register
                </Link>
              </Typography>
            </Box>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <TextField
              label="Full name"
              fullWidth
              sx={{ mb: 2 }}
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />
            <TextField
              label="Email"
              fullWidth
              sx={{ mb: 2 }}
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              sx={{ mb: 2 }}
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
              disabled={loading}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select value={role} onChange={e => setRole(e.target.value)} label="Role" disabled={loading}>
                <MenuItem value="operator">Operator</MenuItem>
                <MenuItem value="insurance">Insurance</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Creating...' : 'Register'}
              </Button>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component="button" onClick={() => { setMode('login'); setGlobalMsg(null); }}>
                  Login
                </Link>
              </Typography>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
}
