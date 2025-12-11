import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer, { signoutSuccess } from './user/userSlice';
import themeReducer from './theme/themeSlice';
import favoritesReducer from './favorites/favoritesSlice';
import historyReducer from './history/historySlice';
import notificationsReducer from './notifications/notificationsSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  favorites: favoritesReducer,
  history: historyReducer,
  notifications: notificationsReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: ['user', 'favorites', 'history', 'notifications'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const logoutAndClearPersistedData = () => (dispatch) => {
  dispatch(signoutSuccess());
  storage.removeItem('persist:root');
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
