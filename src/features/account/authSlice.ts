import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { AuthState, LoginData, User } from 'features/types';
import { history } from 'helpers';
import AuthService from './authService';
import TokenService from './tokenService';

// create slice

const name = 'auth';
const initialState = createInitialState();
const reducers = createReducers();
const extraActions = createExtraActions();
const slice = createSlice({
    name,
    initialState,
    reducers,
    extraReducers: (builder) => {
        var { pending: loginPending, fulfilled: loginFulfilled, rejected: loginRejected } = extraActions.login;
        builder
            .addCase(loginPending, (state) => {
                state.error = undefined;
            })
            .addCase(loginFulfilled, (state, action) => {
                const user = action.payload;

                // store user details and jwt token in local storage to keep user logged in between page refreshes
                state.user = user;
                TokenService.setUser(user);

                if (history.navigate) {
                    history.navigate('/')
                }
            })
            .addCase(loginRejected, (state, action) => {
                state.error = action.payload
            })
    }
});

// exports

export const authActions = { ...slice.actions, ...extraActions };
export const authReducer = slice.reducer;

// implementation

function createInitialState(): AuthState {
    let jsonUser = JSON.parse(localStorage.getItem('user') as string);

    return {
        user: jsonUser,
    }
}

function createReducers() {
    return {
        logout
    }

    function logout(state: AuthState) {
        state.user = undefined;
        TokenService.removeUser();
        history.navigate && history.navigate('/account/login')
    }
}

function createExtraActions() {

    return {
        login: login()
    }

    function login() {
        return createAsyncThunk<User, LoginData>(
            `${name}/login`,
            async (loginData: LoginData, { rejectWithValue }) => {
                try {
                    return await AuthService.login(loginData)
                } catch (error) {
                    let message;
                    if (axios.isAxiosError(error)) {
                        const err = error as AxiosError<ServerError>;
                        message =
                            (err.response &&
                                err.response.data &&
                                err.response.data.message) ||
                            err.message ||
                            err.toString();
                    } else {
                        message = 'Unbekannter Fehler'
                    }
                    return rejectWithValue(message)
                }
            }
        )
    }
}

type ServerError = {
    message: string;
    response: {
        data: {
            message: string;
        }
    }
}