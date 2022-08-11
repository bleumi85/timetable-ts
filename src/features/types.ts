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
    expirationDate: Date;
    created: Date,
    updated?: Date;
    isVerified: boolean;
    jwtToken: string;
}

export type User = IUser;

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