import { configureStore, Action, ThunkAction } from '@reduxjs/toolkit';

// reducers
import { authReducer } from 'features/account/authSlice';

// apis
import { timetableApi } from 'features/timetable';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [timetableApi.reducerPath]: timetableApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            timetableApi.middleware
        )
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>