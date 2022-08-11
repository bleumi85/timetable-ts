import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL;

export const timetableAPI = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
    },
    withCredentials: true
});