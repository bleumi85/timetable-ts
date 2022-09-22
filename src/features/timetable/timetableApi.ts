import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RootState } from 'app/store';
import { authActions } from 'features/account/authSlice';
import { Location, LocationRequest, Schedule, ScheduleAdmin, ScheduleRequest, Task, TaskRequest, User, UserRequest } from 'features/types';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment);

const baseUrl = process.env.REACT_APP_API_URL;

const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders(headers, { getState }) {
        const token = (getState() as RootState).auth.user?.jwtToken;

        // If we have a token set in state, let's assume that we should be passing it.
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }

        return headers;
    },
    credentials: 'include'
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
        // try to get a new token
        const refreshResult = await baseQuery({
            url: '/accounts/refresh-token',
            method: 'post'
        }, api, extraOptions);
        if (refreshResult.data) {
            // store the new token
            api.dispatch(authActions.refreshToken(refreshResult.data as User));
            // retry the initial query
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(authActions.logout())
        }
    }
    return result;
}

export const timetableApi = createApi({
    reducerPath: 'timetableApi',
    baseQuery: baseQueryWithReauth,
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
                method: 'POST',
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
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Locations', id }]
        }),
        deleteLocation: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/locations/${id}`,
                method: 'DELETE'
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
                method: 'POST',
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
                method: 'PATCH',
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
        // Schedules
        getSchedules: build.query<ScheduleAdmin[], void>({
            query: () => '/schedules?include=account;location;task',
            providesTags: (result) =>
                result ?
                    [
                        ...result.map(({ id }) => ({ type: 'Schedules', id } as const)),
                        { type: 'Schedules', id: 'ScheduleLIST' }
                    ] : [{ type: 'Schedules', id: 'ScheduleLIST' }],
            transformResponse: (response: ScheduleAdmin[]) => {
                const data = response.map((schedule) => {
                    const hasConflict = !overlaps(response, schedule);
                    return { ...schedule, hasConflict }
                })
                return data;
            }
        }),
        addSchedule: build.mutation<ScheduleRequest, Partial<ScheduleRequest>>({
            query: (body) => ({
                url: '/schedules',
                method: 'POST',
                body
            }),
            invalidatesTags: [{ type: 'Schedules', id: 'ScheduleLIST' }]
        }),
        getSchedule: build.query<Schedule, string | undefined>({
            query: (id) => id ? `/schedules/${id}` : '/schedules/204',
            providesTags: (result, error, id) => [{ type: 'Schedules', id }]
        }),
        updateSchedulesPDF: build.mutation<string[], string[]>({
            query: (body) => ({
                url: '/schedules/pdfStatus',
                method: 'PATCH',
                body
            }),
            invalidatesTags: () => [{ type: 'Schedules', id: 'ScheduleLIST' }]
        }),
        updateSchedule: build.mutation<ScheduleRequest, Partial<ScheduleRequest>>({
            query: ({ id, ...patch }) => ({
                url: `/schedules/${id}`,
                method: 'PATCH',
                body: patch
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Schedules', id }]
        }),
        deleteSchedule: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/schedules/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Schedules', id }]
        }),
    })
});

export const {
    useGetAccountsQuery, useAddAccountMutation, useGetAccountQuery, useUpdateAccountMutation, useDeleteAccountMutation,
    useGetLocationsQuery, useAddLocationMutation, useGetLocationQuery, useUpdateLocationMutation, useDeleteLocationMutation,
    useGetSchedulesQuery, useAddScheduleMutation, useGetScheduleQuery, useUpdateScheduleMutation, useUpdateSchedulesPDFMutation, useDeleteScheduleMutation,
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

function overlaps(schedules: ScheduleAdmin[], schedule: ScheduleAdmin): boolean {
    const rangeHelper = moment.range('1999-12-31/2000-01-01');
    const ranges = schedules.map((s) => {
        if (s.account.id !== schedule.account.id || s.id === schedule.id) return rangeHelper;
        const start = moment(s.timeFrom);
        const end = moment(s.timeTo);
        return moment.range(start, end);
    }).filter(r => !r.isSame(rangeHelper))

    if (ranges.length === 0) return true;

    const start1 = moment(schedule.timeFrom);
    const end1 = moment(schedule.timeTo);
    const range1 = moment.range(start1, end1);

    let hasNoConflict = true;

    for (let i = 0; i < ranges.length; i++) {
        hasNoConflict = hasNoConflict && !ranges[i].overlaps(range1)
    }

    return hasNoConflict;
}