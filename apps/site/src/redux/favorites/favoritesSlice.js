import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // favorites feature
    toggleFavorite: (state, action) => {
      const post = action.payload;
      const exists = state.items.find((item) => item._id === post._id);
      if (exists) {
        state.items = state.items.filter((item) => item._id !== post._id);
      } else {
        state.items.push({ ...post, addedAt: new Date().toISOString() });
      }
    },
    clearFavorites: (state) => {
      state.items = [];
    },
  },
});

export const { toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
