import { createSlice } from '@reduxjs/toolkit';

const availableCategories = ['news', 'politique', 'science', 'sport', 'cinema'];

const initialState = {
  categories: availableCategories,
  subscribed: [],
  unread: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    toggleSubscription: (state, action) => {
      const category = action.payload;
      if (!state.categories.includes(category)) return;
      if (state.subscribed.includes(category)) {
        state.subscribed = state.subscribed.filter((c) => c !== category);
      } else {
        state.subscribed.push(category);
      }
    },
    setCategories: (state, action) => {
      const next = Array.isArray(action.payload) ? action.payload : [];
      state.categories = next.length ? next : availableCategories;
      state.subscribed = state.subscribed.filter((cat) => state.categories.includes(cat));
    },
    setUnreadBadge: (state, action) => {
      state.unread = action.payload;
    },
    clearNotificationsBadge: (state) => {
      state.unread = 0;
    },
  },
});

export const { toggleSubscription, setCategories, setUnreadBadge, clearNotificationsBadge } = notificationsSlice.actions;
export default notificationsSlice.reducer;
