import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
export const fetchDepartments = createAsyncThunk('departments/fetch', async ()=>{ try{ const res = await api.get('/departments'); return res.data; }catch(e){ return []; } });
export const createDepartment = createAsyncThunk('departments/create', async (payload,{rejectWithValue})=>{ try{ const res = await api.post('/departments', payload); return res.data; }catch(e){ return rejectWithValue(e.response?.data || { message:e.message }); } });
export const updateDepartment = createAsyncThunk('departments/update', async ({ id, payload }, { rejectWithValue }) => { try { const res = await api.put(`/departments/${id}`, payload); return res.data; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); } });
export const deleteDepartment = createAsyncThunk('departments/delete', async (id, { rejectWithValue }) => { try { await api.delete(`/departments/${id}`); return id; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); } });
const slice = createSlice({ name:'departments', initialState:{ list:[], loading:false, error:null }, reducers:{}, extraReducers: b=>{ b.addCase(fetchDepartments.pending,(s)=>{s.loading=true}); b.addCase(fetchDepartments.fulfilled,(s,a)=>{s.loading=false;s.list=a.payload}); b.addCase(fetchDepartments.rejected,(s,a)=>{s.loading=false;s.error=a.payload?.message}); b.addCase(createDepartment.fulfilled,(s,a)=>{ s.list.unshift(a.payload); }); }});
export default slice.reducer;
