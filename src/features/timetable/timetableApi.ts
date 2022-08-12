import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RootState } from 'app/store';
import { Location, LocationRequest, Task, TaskRequest, User, UserRequest } from 'features/types';

const baseUrl = process.env.REACT_APP_API_URL;

export const timetableApi = createApi({
    reducerPath: 'timetableApi',
    baseQuery: fetchBaseQuery({
        baseUrl,
        prepareHeaders(headers, { getState }) {
            const token = (getState() as RootState).auth.user?.jwtToken;

            // If we have a token set in state, let's assume that we should be passing it.
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }

            return headers;
        }
    }),
    tagTypes: ['Accounts', 'Locations', 'Schedules', 'Tasks'],
    endpoints: (build) => ({
        // Accounts
        getAccounts: build.query<User[], void>({
            query: () => '/accounts?include=includeAll',
            providesTags: (result) =>
                result ?
                    [
                        ...result.map(({ id }) => ({ type: 'Accounts', id } as const)),
                        { type: 'Accounts', id: 'AccountLIST' }
                    ] : [{ type: 'Accounts', id: 'AccountLIST' }]
        }),
        addAccount: build.mutation<UserRequest, Partial<UserRequest>>({
            query: (body) => ({
                url: '/accounts',
                method: 'post',
                body
            }),
            invalidatesTags: [{ type: 'Accounts', id: 'AccountLIST' }]
        }),
        getAccount: build.query<User, string | undefined>({
            query: (id) => id ? `/accounts/${id}` : '/accounts/204',
            providesTags: (result, error, id) => [{ type: 'Accounts', id }]
        }),
        updateAccount: build.mutation<UserRequest, Partial<UserRequest>>({
            query: ({ id, ...patch }) => ({
                url: `/accounts/${id}`,
                method: 'patch',
                body: patch
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Accounts', id }]
        }),
        deleteAccount: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/accounts/${id}`,
                method: 'delete'
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Accounts', id }]
        }),
        // Locations
        getLocations: build.query<Location[], void>({
            query: () => '/locations?include=schedulesCount',
            providesTags: (result) =>
                result ?
                    [
                        ...result.map(({ id }) => ({ type: 'Locations', id } as const)),
                        { type: 'Locations', id: 'LocationLIST' }
                    ] : [{ type: 'Locations', id: 'LocationLIST' }]
        }),
        addLocation: build.mutation<LocationRequest, Partial<LocationRequest>>({
            query: (body) => ({
                url: '/locations',
                method: 'post',
                body
            }),
            invalidatesTags: [{ type: 'Locations', id: 'LocationLIST' }]
        }),
        getLocation: build.query<Location, string | undefined>({
            query: (id) => id ? `/locations/${id}` : '/locations/204',
            providesTags: (result, error, id) => [{ type: 'Locations', id }]
        }),
        updateLocation: build.mutation<LocationRequest, Partial<LocationRequest>>({
            query: ({ id, ...patch }) => ({
                url: `/locations/${id}`,
                method: 'patch',
                body: patch
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Tasks', id }]
        }),
        deleteLocation: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/locations/${id}`,
                method: 'delete'
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Locations', id }]
        }),
        // Tasks
        getTasks: build.query<Task[], void>({
            query: () => '/tasks?include=schedulesCount',
            providesTags: (result) =>
                result ?
                    [
                        ...result.map(({ id }) => ({ type: 'Tasks', id } as const)),
                        { type: 'Tasks', id: 'TaskLIST' }
                    ] : [{ type: 'Tasks', id: 'TaskLIST' }]
        }),
        addTask: build.mutation<TaskRequest, Partial<TaskRequest>>({
            query: (body) => ({
                url: '/tasks',
                method: 'post',
                body
            }),
            invalidatesTags: [{ type: 'Tasks', id: 'TaskLIST' }]
        }),
        getTask: build.query<Task, string | undefined>({
            query: (id) => id ? `/tasks/${id}` : '/tasks/204',
            providesTags: (result, error, id) => [{ type: 'Tasks', id }]
        }),
        updateTask: build.mutation<TaskRequest, Partial<TaskRequest>>({
            query: ({ id, ...patch }) => ({
                url: `/tasks/${id}`,
                method: 'patch',
                body: patch
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Tasks', id }]
        }),
        deleteTask: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/tasks/${id}`,
                method: 'delete'
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Tasks', id }]
        }),
    })
});

export const {
    useGetAccountsQuery, useAddAccountMutation, useGetAccountQuery, useUpdateAccountMutation, useDeleteAccountMutation,
    useGetLocationsQuery, useAddLocationMutation, useGetLocationQuery, useUpdateLocationMutation, useDeleteLocationMutation,
    useGetTasksQuery, useAddTaskMutation, useGetTaskQuery, useUpdateTaskMutation, useDeleteTaskMutation,
} = timetableApi

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return typeof error === 'object' && error != null && 'status' in error;
}

function isErrorWithMessage(error: unknown): error is { message: string } {
    return typeof error === 'object' && error != null && 'message' in error && typeof (error as any).message === 'string'
}

export function getErrorMessage(err: unknown): string {
    let errMsg: string = 'unknown';
    if (isFetchBaseQueryError(err)) {
        errMsg = 'error' in err ? err.error : JSON.stringify(err.data)
    } else if (isErrorWithMessage(err)) {
        errMsg = err.message
    }
    return errMsg;
}