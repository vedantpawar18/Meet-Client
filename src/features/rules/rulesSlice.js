import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async thunk to fetch all rules
export const fetchRules = createAsyncThunk("rules/fetch", async () => {
  const response = await api.get("/rules");
  return response.data;
});

// Async thunk to create a new rule
export const createRule = createAsyncThunk(
  "rules/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/rules", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Async thunk to update an existing rule
export const updateRule = createAsyncThunk(
  "rules/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/rules/${id}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to delete a rule
export const deleteRule = createAsyncThunk(
  "rules/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/rules/${id}`);
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

// Create rules slice
const rulesSlice = createSlice({
  name: "rules",
  initialState,
  extraReducers: (builder) => {
    // Handle fetchRules success
    builder.addCase(fetchRules.fulfilled, (state, action) => {
      state.list = action.payload;
    });

    // Handle createRule success - add new rule to the beginning of the list
    builder.addCase(createRule.fulfilled, (state, action) => {
      state.list.unshift(action.payload);
    });
  },
});

export default rulesSlice.reducer;
