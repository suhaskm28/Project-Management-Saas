import { api } from './api';

export const login = (email: string, password: string) =>
    api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

export const register = (
    email: string,
    fullName: string,
    password: string,
) =>
    api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, fullName, password }),
    });

export const me = () => api('/users/me');

export const updateProfile = (data: { fullName?: string; email?: string; bio?: string; phone?: string }) =>
    api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });

export const updatePassword = (data: { currentPassword: string; newPassword: string }) =>
    api('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });

export const logout = () =>
    api('/auth/logout', {
        method: 'POST',
    });

