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
}

interface ITask {
    id: string;
    title: string;
    color: string;
    accountId: string;
    schedulesCount?: number;
}

interface ITaskRequest extends Omit<ITask, 'id'>, Partial<Pick<ITask, 'id'>> { }

interface ILocationRequest extends Omit<ILocation, 'id'>, Partial<Pick<ILocation, 'id'>> { }

interface ISchedule {
    id: string;
    timeFrom: Date;
    timeTo: Date;
    remark?: string;
    isTransferred: boolean;
    locationId: string;
    taskId: string;
    accountId: string;
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