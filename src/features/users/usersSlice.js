import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchUsers = createAsyncThunk('users/fetch', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/users', { params });
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || { message: e.message });
  }
});

export const getUser = createAsyncThunk('users/get', async (id, { rejectWithValue }) => {
  try { const res = await api.get(`/users/${id}`); return res.data; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const createUser = createAsyncThunk('users/create', async (payload, { rejectWithValue }) => {
  try { const res = await api.post('/auth/register', payload); return res.data; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const updateUser = createAsyncThunk('users/update', async ({ id, payload }, { rejectWithValue }) => {
  try { const res = await api.put(`/users/${id}`, payload); return res.data; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const deleteUser = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/users/${id}`); return id; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

const slice = createSlice({
  name: 'users',
  initialState: { list: [], loading: false, error: null, current: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchUsers.pending, s => { s.loading = true; s.error = null });
    b.addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.list = a.payload.items || a.payload; });
    b.addCase(fetchUsers.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message });

    b.addCase(getUser.pending, s => { s.loading = true });
    b.addCase(getUser.fulfilled, (s, a) => { s.loading = false; s.current = a.payload });
    b.addCase(getUser.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message });

    b.addCase(createUser.fulfilled, (s, a) => { s.list.unshift(a.payload) });
    b.addCase(deleteUser.fulfilled, (s, a) => { s.list = s.list.filter(u => u._id !== a.payload) });
    b.addCase(updateUser.fulfilled, (s, a) => { s.current = a.payload; s.list = s.list.map(u => u._id === a.payload._id ? a.payload : u) });
  }
});

export default slice.reducer;
