import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async thunk to fetch all departments
export const fetchDepartments = createAsyncThunk(
  "departments/fetch",
  async () => {
    try {
      const response = await api.get("/departments");
      return response.data;
    } catch (error) {
      // Return empty array on error instead of throwing
      return [];
    }
  }
);

// Async thunk to create a new department
export const createDepartment = createAsyncThunk(
  "departments/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/departments", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to update an existing department
export const updateDepartment = createAsyncThunk(
  "departments/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/departments/${id}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to delete a department
export const deleteDepartment = createAsyncThunk(
  "departments/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/departments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Initial state
const initialState = {
  list: [],
  loading: false,
  error: null,
};

// Create departments slice
const departmentsSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle fetchDepartments pending state
    builder.addCase(fetchDepartments.pending, (state) => {
      state.loading = true;
    });

    // Handle fetchDepartments success
    builder.addCase(fetchDepartments.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
    });

    // Handle fetchDepartments failure
    builder.addCase(fetchDepartments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // Handle createDepartment success - add new department to the beginning of the list
    builder.addCase(createDepartment.fulfilled, (state, action) => {
      state.list.unshift(action.payload);
    });
  },
});

export default departmentsSlice.reducer;
