import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try { const res = await api.post('/auth/login',{ email, password }); return res.data; } catch (err) { return rejectWithValue(err.response?.data || { message: err.message }); }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/users/me'); return res.data; } catch (err) { return rejectWithValue(err.response?.data || { message: err.message }); }
});

const initialState = { token: localStorage.getItem('token') || null, user: JSON.parse(localStorage.getItem('user') || 'null'), status: 'idle', error: null };
const slice = createSlice({ name:'auth', initialState, reducers: { logout(state){ state.token=null; state.user=null; localStorage.removeItem('token'); localStorage.removeItem('user'); } }, extraReducers: b=>{
  b.addCase(login.pending,(s)=>{s.status='loading';s.error=null});
  b.addCase(login.fulfilled,(s,a)=>{ s.status='succeeded'; s.token=a.payload.token; s.user=a.payload.user; localStorage.setItem('token', a.payload.token); localStorage.setItem('user', JSON.stringify(a.payload.user)); });
  b.addCase(login.rejected,(s,a)=>{ s.status='failed'; s.error=a.payload?.message || 'Login failed'; });

  b.addCase(fetchMe.pending,(s)=>{ s.status='loading'; });
  b.addCase(fetchMe.fulfilled,(s,a)=>{ s.status='succeeded'; s.user = a.payload; localStorage.setItem('user', JSON.stringify(a.payload)); });
  b.addCase(fetchMe.rejected,(s,a)=>{ s.status='failed'; s.error = a.payload?.message; s.token = null; s.user = null; localStorage.removeItem('token'); localStorage.removeItem('user'); });
}});

export const { logout } = slice.actions; export default slice.reducer;
