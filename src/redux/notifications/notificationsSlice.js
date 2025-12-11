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
      if (!availableCategories.includes(category)) return;
      if (state.subscribed.includes(category)) {
        state.subscribed = state.subscribed.filter((c) => c !== category);
      } else {
        state.subscribed.push(category);
      }
    },
    setUnreadBadge: (state, action) => {
      state.unread = action.payload;
    },
    clearNotificationsBadge: (state) => {
      state.unread = 0;
    },
  },
});

export const { toggleSubscription, setUnreadBadge, clearNotificationsBadge } = notificationsSlice.actions;
export default notificationsSlice.reducer;
