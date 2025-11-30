import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async thunk to fetch parcels with optional query parameters
export const fetchParcels = createAsyncThunk(
  "parcels/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/parcels", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to create a new parcel
export const createParcel = createAsyncThunk(
  "parcels/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/parcels", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to update an existing parcel
export const updateParcel = createAsyncThunk(
  "parcels/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/parcels/${id}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to upload parcels from XML file
export const uploadParcelsXml = createAsyncThunk(
  "parcels/upload",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/parcels/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to approve insurance for a parcel
export const approveInsurance = createAsyncThunk(
  "parcels/approve",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/parcels/${id}/approve-insurance`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to delete a single parcel
export const deleteParcel = createAsyncThunk(
  "parcels/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/parcels/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to delete all parcels
export const deleteAllParcels = createAsyncThunk(
  "parcels/deleteAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete("/parcels");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Initial state
const initialState = {
  list: [], // Array of parcels
  loading: false, // Loading state
  error: null, // Error message if any
  meta: {}, // Additional metadata (pagination, etc.)
};

// Create parcels slice
const parcelsSlice = createSlice({
  name: "parcels",
  initialState,
  reducers: {
    // Remove a parcel from the list by ID
    removeParcel(state, action) {
      state.list = state.list.filter((parcel) => parcel._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Handle fetchParcels pending state
    builder.addCase(fetchParcels.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    // Handle fetchParcels success
    builder.addCase(fetchParcels.fulfilled, (state, action) => {
      state.loading = false;
      // Handle both array response and paginated response
      state.list = Array.isArray(action.payload)
        ? action.payload
        : action.payload.items || [];
      state.meta = action.payload.meta || {};
    });

    // Handle fetchParcels failure
    builder.addCase(fetchParcels.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // Handle createParcel success - add new parcel to the beginning of the list
    builder.addCase(createParcel.fulfilled, (state, action) => {
      state.list.unshift(action.payload);
    });

    // Handle uploadParcelsXml success - prepend uploaded parcels to the list
    builder.addCase(uploadParcelsXml.fulfilled, (state, action) => {
      if (action.payload.parcels) {
        state.list = action.payload.parcels.concat(state.list);
      }
    });

    // Handle approveInsurance success - update the parcel in the list
    builder.addCase(approveInsurance.fulfilled, (state, action) => {
      const index = state.list.findIndex(
        (parcel) => parcel._id === action.payload._id
      );
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    });

    // Handle deleteParcel success - remove the parcel from the list
    builder.addCase(deleteParcel.fulfilled, (state, action) => {
      // The deleted parcel ID might be in payload.deletedId or action.meta.arg
      const deletedId = action.payload?.deletedId || action.meta?.arg;
      if (deletedId) {
        state.list = state.list.filter((parcel) => parcel._id !== deletedId);
      }
    });

    // Handle deleteAllParcels success - clear the entire list
    builder.addCase(deleteAllParcels.fulfilled, (state) => {
      state.list = [];
    });
  },
});

export const { removeParcel } = parcelsSlice.actions;
export default parcelsSlice.reducer;
