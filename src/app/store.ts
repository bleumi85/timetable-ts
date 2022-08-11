import { configureStore, Action, ThunkAction } from '@reduxjs/toolkit';

// reducers
import { authReducer } from 'features/account/authSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer
    }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>