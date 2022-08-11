import { User } from 'features/types';

const TokenService = {
    setUser,
    removeUser
}

function setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user))
}

function removeUser() {
    localStorage.removeItem('user');
}

export default TokenService;