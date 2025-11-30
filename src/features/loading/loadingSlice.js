import { createSlice } from "@reduxjs/toolkit";

// Loading slice tracks the number of active async operations
// Used to show/hide global loading indicator
const loadingSlice = createSlice({
  name: "loading",
  initialState: {
    count: 0, // Number of active async operations
  },
  reducers: {
    // Increment loading count (called when async operation starts)
    increment(state) {
      state.count += 1;
    },
    // Decrement loading count (called when async operation completes)
    // Ensures count never goes below 0
    decrement(state) {
      state.count = Math.max(0, state.count - 1);
    },
  },
});

export const { increment, decrement } = loadingSlice.actions;
// Export with shorter names for backward compatibility
export const inc = increment;
export const dec = decrement;
export default loadingSlice.reducer;
