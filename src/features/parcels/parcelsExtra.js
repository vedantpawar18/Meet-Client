import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const getParcelById = createAsyncThunk('parcels/getById', async (id, { rejectWithValue }) => {
  try { const res = await api.get(`/parcels/${id}`); return res.data; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const reassignParcel = createAsyncThunk('parcels/reassign', async ({ id, departmentId }, { rejectWithValue }) => {
  try { const res = await api.post(`/parcels/${id}/reassign`, { departmentId }); return res.data; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const markProcessed = createAsyncThunk('parcels/markProcessed', async (id, { rejectWithValue }) => {
  try { const res = await api.post(`/parcels/${id}/mark-processed`); return res.data; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const exportParcels = createAsyncThunk('parcels/export', async ({ format='csv', params={} }, { rejectWithValue }) => {
  try {
    const res = await api.get('/parcels/export', { params: { ...params, format }, responseType: 'blob' });
    return { blob: res.data, headers: res.headers };
  } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const downloadRawXml = createAsyncThunk('parcels/downloadRaw', async (id, { rejectWithValue }) => {
  try { const res = await api.get(`/parcels/${id}/raw`, { responseType: 'blob' }); return { blob: res.data }; } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

// NOTE: these are standalone thunks that can be imported where needed in components
