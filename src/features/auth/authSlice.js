import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async thunk for user login
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Async thunk to fetch current user profile
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Initial state - load token and user from localStorage if available
const initialState = {
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user") || "null"),
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Create auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Logout action - clears token and user data
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    // Handle login pending state
    builder.addCase(login.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });

    // Handle login success
    builder.addCase(login.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.token = action.payload.token;
      state.user = action.payload.user;
      // Save to localStorage for persistence
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    });

    // Handle login failure
    builder.addCase(login.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload?.message || "Login failed";
    });

    // Handle fetchMe pending state
    builder.addCase(fetchMe.pending, (state) => {
      state.status = "loading";
    });

    // Handle fetchMe success
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    });

    // Handle fetchMe failure (token might be invalid)
    builder.addCase(fetchMe.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload?.message;
      state.token = null;
      state.user = null;
      // Clear invalid token from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
