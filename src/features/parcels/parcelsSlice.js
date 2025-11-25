import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchParcels = createAsyncThunk('parcels/fetch', async (params={}, { rejectWithValue })=>{ try{ const res = await api.get('/parcels', { params }); return res.data; }catch(e){ return rejectWithValue(e.response?.data || { message: e.message }); } });
export const createParcel = createAsyncThunk('parcels/create', async (payload,{rejectWithValue})=>{ try{ const res = await api.post('/parcels', payload); return res.data; }catch(e){ return rejectWithValue(e.response?.data || { message:e.message }); } });
export const updateParcel = createAsyncThunk('parcels/update', async ({ id, payload }, { rejectWithValue }) => { try { const res = await api.put(`/parcels/${id}`, payload); return res.data; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); } });
export const uploadParcelsXml = createAsyncThunk('parcels/upload', async (file,{rejectWithValue})=>{ try{ const fd=new FormData(); fd.append('file', file); const res = await api.post('/parcels/upload', fd, { headers:{ 'Content-Type':'multipart/form-data' } }); return res.data; }catch(e){ return rejectWithValue(e.response?.data || { message:e.message }); } });
export const approveInsurance = createAsyncThunk('parcels/approve', async (id,{rejectWithValue})=>{ try{ const res=await api.post(`/parcels/${id}/approve-insurance`); return res.data; }catch(e){ return rejectWithValue(e.response?.data || { message:e.message }); } });
export const deleteParcel = createAsyncThunk('parcels/delete', async (id,{rejectWithValue})=>{ try{ const res = await api.delete(`/parcels/${id}`); return res.data; }catch(e){ return rejectWithValue(e.response?.data || { message: e.message }); } });
export const deleteAllParcels = createAsyncThunk('parcels/deleteAll', async (_, { rejectWithValue }) => { try { const res = await api.delete('/parcels'); return res.data; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); } });

const slice = createSlice({ name:'parcels', initialState:{ list:[], loading:false, error:null, meta:{} }, reducers:{ removeParcel(state, action){ state.list = state.list.filter(p=>p._id!==action.payload); } }, extraReducers: b=>{
  b.addCase(fetchParcels.pending,(s)=>{s.loading=true;s.error=null});
  b.addCase(fetchParcels.fulfilled,(s,a)=>{ s.loading=false; s.list = Array.isArray(a.payload)? a.payload : (a.payload.items || []); s.meta = a.payload.meta || {}; });
  b.addCase(fetchParcels.rejected,(s,a)=>{ s.loading=false; s.error=a.payload?.message });
  b.addCase(createParcel.fulfilled,(s,a)=>{ s.list.unshift(a.payload); });
  b.addCase(uploadParcelsXml.fulfilled,(s,a)=>{ if(a.parcels) s.list = a.parcels.concat(s.list); });
  b.addCase(approveInsurance.fulfilled,(s,a)=>{ const idx = s.list.findIndex(p=>p._id===a.payload._id); if(idx!==-1) s.list[idx]=a.payload; });
  b.addCase(deleteParcel.fulfilled,(s,a)=>{ // a.payload may contain deletedId
    const id = a.payload?.deletedId || a.meta?.arg;
    if(id) s.list = s.list.filter(p=>p._id!==id);
  });
  b.addCase(deleteAllParcels.fulfilled,(s,a)=>{ s.list = []; });
 }});
export const { removeParcel } = slice.actions;
export default slice.reducer;
