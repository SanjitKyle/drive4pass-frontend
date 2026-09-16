import axios from './axios';

export const AuthService = {
    login(data) {
        return axios.post('/login', data);
    },

    logout() {
        localStorage.clear();
        window.location.href = '/login';
    },

    getRole() {
        return localStorage.getItem('role');
    },

    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        console.log('token', token)
        return Boolean(token && token !== 'undefined' && token !== 'null');
    }

};
