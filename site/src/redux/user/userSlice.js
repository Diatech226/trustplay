import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import asyncStorage from '../../lib/asyncStorage';

const persistAuth = (user, token) => {
  if (user && token) {
    asyncStorage.setItem('auth', JSON.stringify({ user, token }));
  } else {
    asyncStorage.removeItem('auth');
  }
};

export const restoreSession = createAsyncThunk('user/restoreSession', async () => {
  const raw = await asyncStorage.getItem('auth');
  if (!raw) return { user: null, token: null };
  try {
    const parsed = JSON.parse(raw);
    return { user: parsed.user || parsed.currentUser || null, token: parsed.token || null };
  } catch (error) {
    return { user: null, token: null };
  }
});

const initialState = {
  currentUser: null,
  token: null,
  error: null,
  loading: false,
  initialized: false,
};

const resolveAuthPayload = (payload = {}) => {
  const user = payload.user || payload.data?.user || payload.currentUser || payload;
  const token = payload.token || payload.data?.token || payload.accessToken;
  return { user, token };
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
      const { user } = resolveAuthPayload(action.payload);
      state.currentUser = user;
      state.loading = false;
      state.error = null;
      persistAuth(user, state.token);
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
      state.token = null;
      state.loading = false;
      state.error = null;
      persistAuth(null, null);
    },
    deleteUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signoutSuccess: (state) => {
      state.currentUser = null;
      state.token = null;
      state.error = null;
      state.loading = false;
      persistAuth(null, null);
    },
    signInSuccess: (state, action) => {
      const { user, token } = resolveAuthPayload(action.payload);
      state.currentUser = user;
      state.token = token || state.token;
      state.loading = false;
      state.error = null;
      persistAuth(user, state.token);
    },
    setUser: (state, action) => {
      const { user, token } = resolveAuthPayload(action.payload);
      state.currentUser = user;
      state.token = token || state.token;
      state.loading = false;
      state.error = null;
      persistAuth(user, state.token);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
        state.initialized = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
      });
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
