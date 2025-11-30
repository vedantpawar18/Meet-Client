import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async thunk to get a single parcel by ID
export const getParcelById = createAsyncThunk(
  "parcels/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/parcels/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to reassign a parcel to a different department
export const reassignParcel = createAsyncThunk(
  "parcels/reassign",
  async ({ id, departmentId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/parcels/${id}/reassign`, {
        departmentId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to mark a parcel as processed
export const markProcessed = createAsyncThunk(
  "parcels/markProcessed",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/parcels/${id}/mark-processed`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to export parcels in various formats (CSV, Excel, etc.)
export const exportParcels = createAsyncThunk(
  "parcels/export",
  async ({ format = "csv", params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get("/parcels/export", {
        params: { ...params, format },
        responseType: "blob", // Expect binary data
      });
      return { blob: response.data, headers: response.headers };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to download the raw XML file for a parcel
export const downloadRawXml = createAsyncThunk(
  "parcels/downloadRaw",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/parcels/${id}/raw`, {
        responseType: "blob", // Expect binary data
      });
      return { blob: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// NOTE: These are standalone thunks that can be imported where needed in components
// They are not part of the parcelsSlice reducer, so they need to be handled separately
