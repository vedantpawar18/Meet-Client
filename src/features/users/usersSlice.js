import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async thunk to fetch all users with optional query parameters
export const fetchUsers = createAsyncThunk(
  "users/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/users", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to get a single user by ID
export const getUser = createAsyncThunk(
  "users/get",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to create a new user (registration)
export const createUser = createAsyncThunk(
  "users/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to update an existing user
export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to delete a user
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
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
  list: [], // Array of all users
  loading: false, // Loading state
  error: null, // Error message if any
  current: null, // Currently selected user
};

// Create users slice
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle fetchUsers pending state
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    // Handle fetchUsers success
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      // Handle both array response and paginated response
      state.list = action.payload.items || action.payload;
    });

    // Handle fetchUsers failure
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // Handle getUser pending state
    builder.addCase(getUser.pending, (state) => {
      state.loading = true;
    });

    // Handle getUser success
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.loading = false;
      state.current = action.payload;
    });

    // Handle getUser failure
    builder.addCase(getUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // Handle createUser success - add new user to the beginning of the list
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.list.unshift(action.payload);
    });

    // Handle deleteUser success - remove user from the list
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.list = state.list.filter((user) => user._id !== action.payload);
    });

    // Handle updateUser success - update both current and list
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.current = action.payload;
      state.list = state.list.map((user) =>
        user._id === action.payload._id ? action.payload : user
      );
    });
  },
});

export default usersSlice.reducer;
