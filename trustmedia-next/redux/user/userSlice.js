import { createSlice } from '@reduxjs/toolkit';

const getInitialUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const initialState = {
  currentUser: getInitialUser(),
  error: null,
  loading: false,
};


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('user', JSON.stringify(action.payload));
        window.localStorage.setItem('token', action.payload.token);
      }
    },
    
    updateFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    deleteUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signoutSuccess: (state) => {
      state.currentUser = null;
      state.error = null;
      state.loading = false;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('user');
        window.localStorage.removeItem('token');
      }
    },
    
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('user', JSON.stringify(action.payload));
        window.localStorage.setItem('token', action.payload.token);
      }
    },
    
    setUser: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('user', JSON.stringify(action.payload));
        window.localStorage.setItem('token', action.payload.token);
      }
    },
    
  },
});

export const {
  setUser,
  signInStart,
  signInSuccess,
  signInFailure,
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} = userSlice.actions;

export default userSlice.reducer;