import { configureStore } from '@reduxjs/toolkit'
import statusReducer from '../features/status/statusSlice'

export const store = configureStore({
  reducer: {
    status: statusReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
