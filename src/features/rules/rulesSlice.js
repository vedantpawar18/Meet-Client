import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
export const fetchRules = createAsyncThunk('rules/fetch', async ()=>{ const res = await api.get('/rules'); return res.data; });
export const createRule = createAsyncThunk('rules/create', async (payload,{rejectWithValue})=>{ try{ const res = await api.post('/rules', payload); return res.data;}catch(e){return rejectWithValue(e.response?.data)} });
export const updateRule = createAsyncThunk('rules/update', async ({ id, payload }, { rejectWithValue }) => { try { const res = await api.put(`/rules/${id}`, payload); return res.data; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); } });
export const deleteRule = createAsyncThunk('rules/delete', async (id, { rejectWithValue }) => { try { await api.delete(`/rules/${id}`); return id; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); } });
const slice = createSlice({ name:'rules', initialState:{ list:[], loading:false, error:null }, extraReducers:b=>{ b.addCase(fetchRules.fulfilled,(s,a)=>{ s.list=a.payload }); b.addCase(createRule.fulfilled,(s,a)=>{ s.list.unshift(a.payload) }); }});
export default slice.reducer;
