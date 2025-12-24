import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    // reading history
    logReading: (state, action) => {
      const post = action.payload;
      const existingIndex = state.items.findIndex((item) => item._id === post._id);
      const entry = {
        ...post,
        viewedAt: new Date().toISOString(),
      };
      if (existingIndex !== -1) {
        state.items[existingIndex] = entry;
      } else {
        state.items.unshift(entry);
      }
    },
    removeHistoryItem: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    clearHistory: (state) => {
      state.items = [];
    },
  },
});

export const { logReading, removeHistoryItem, clearHistory } = historySlice.actions;
export default historySlice.reducer;
