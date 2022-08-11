import { AxiosResponse } from 'axios';
import { timetableAPI } from 'features/endpoints';
import { LoginData, User } from 'features/types';
import TokenService from './tokenService';

const AuthService = {
    login
};

async function login(data: LoginData) {
    const response: AxiosResponse<User, any> = await timetableAPI.post('accounts/authenticate', data);
    if (response.data.jwtToken) {
        TokenService.setUser(response.data);
    }
    return response.data;
}

export default AuthService;