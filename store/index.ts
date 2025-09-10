import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import eventsReducer from './slices/eventsSlice';
import ticketsReducer from './slices/ticketsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    events: eventsReducer,
    tickets: ticketsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;