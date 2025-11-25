import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: { count: 0 },
  reducers: {
    inc(state) { state.count += 1; },
    dec(state) { state.count = Math.max(0, state.count - 1); },
  },
});

export const { inc, dec } = loadingSlice.actions;
export default loadingSlice.reducer;
