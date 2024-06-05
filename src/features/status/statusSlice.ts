import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface StatusState {
  lightStatus: string | null;
}

const initialState: StatusState = {
  lightStatus: null,
};

export const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setLightStatus: (state, action: PayloadAction<string | null>) => {
      state.lightStatus = action.payload;
    },
  },
});

export const { setLightStatus } = statusSlice.actions;
export const selectLightStatus = (state: RootState) => state.status.lightStatus;
export default statusSlice.reducer;
