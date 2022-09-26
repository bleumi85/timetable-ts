// enums
export enum UserRoles {
    User = 'User',
    Admin = 'Admin'
}

// interfaces

interface IUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRoles;
    created: Date,
    updated?: Date;
    isVerified: boolean;
    jwtToken: string;
    locations: ILocation[];
    tasks: ITask[];
    schedules: ISchedule[]
}

interface ILocation {
    id: string;
    title: string;
    color?: string;
    accountId: string;
    schedulesCount?: number;
    showCompleteMonth: boolean;
    icon?: string;
}

interface ITask {
    id: string;
    title: string;
    color: string;
    accountId: string;
    schedulesCount?: number;
    icon?: string;
}

interface ITaskRequest extends Omit<ITask, 'id'>, Partial<Pick<ITask, 'id'>> { }

interface ILocationRequest extends Omit<ILocation, 'id'>, Partial<Pick<ILocation, 'id'>> { }

interface IScheduleRequest extends Omit<ISchedule, 'id'>, Partial<Pick<ISchedule, 'id'>> {
    remark: string;
}

interface ISchedule {
    id: string;
    timeFrom: Date;
    timeTo: Date;
    remark?: string;
    isTransferred: boolean;
    accountId: string;
    locationId: string;
    taskId: string;
    fileId?: string;
}

interface IScheduleAdmin extends Omit<ISchedule, 'accountId' | 'locationId' | 'taskId'> {
    account: Pick<IUser, 'id' | 'firstName' | 'lastName'>,
    location: Omit<ILocation, 'accountId'>,
    task: Omit<ITask, 'accountId'>,
    hasConflict: boolean
}

interface IUserRequest extends Partial<Pick<IUser, 'id' | 'firstName' | 'lastName' | 'email' | 'role'>> {
    password: string;
    confirmPassword: string;
}

export type User = IUser;
export type UserRequest = IUserRequest;

export type Location = ILocation;
export type LocationRequest = ILocationRequest;

export type Task = ITask;
export type TaskRequest = ITaskRequest;

export type Schedule = ISchedule;
export type ScheduleAdmin = IScheduleAdmin;
export type ScheduleRequest = IScheduleRequest;

interface IAuthState {
    user: IUser | undefined,
    error?: any
}

export type AuthState = IAuthState;

export type LoginData = {
    email: string;
    password: string;
}

export type MessageState = {
    type: 'error' | 'success' | 'info' | 'warning' | undefined;
    message: string;
}

interface Option {
    id: string;
    title: string;
}

export type RadioOption = Option;
export type SelectOption = Option;