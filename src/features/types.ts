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
}

interface IUserRequest extends Omit<IUser, 'id' | 'created' | 'isVerified' | 'jwtToken'>, Partial<Pick<IUser, 'id'>> {
    password: string;
    confirmPassword: string;
}

export type User = IUser;
export type UserRequest = IUserRequest;

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