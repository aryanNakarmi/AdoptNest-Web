export const API = {
    AUTH: {
        LOGIN: '/api/v1/auth/login',
        REGISTER: '/api/v1/auth/register',
        UPDATEPROFILE: '/api/v1/auth/update-profile',
    },
    ADMIN: {
        USERS: '/api/v1/admin/users',
        USER_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
    }
}