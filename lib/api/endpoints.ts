export const API = {
    AUTH: {
        LOGIN: '/api/v1/auth/login',
        REGISTER: '/api/v1/auth/register',
        UPDATEPROFILE: '/api/v1/auth/update-profile',
        REQUEST_PASSWORD_RESET: '/api/v1/auth/request-password-reset',
        RESET_PASSWORD: (token: string) => `/api/v1/auth/reset-password/${token}`

    },
    ADMIN: {
        USERS: '/api/v1/admin/users',
        USER_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
    },
    REPORTS: {
        CREATE: '/api/v1/reports',
        MY_REPORTS: '/api/v1/reports/my-reports',
        ALL_REPORTS: '/api/v1/reports/all',
        REPORT_BY_ID: (id: string) => `/api/v1/reports/${id}`,
        DELETE_REPORT: (id: string) => `/api/v1/reports/${id}`,
        UPDATE_STATUS: (id: string) => `/api/v1/reports/${id}/status`,
        BY_SPECIES: (species: string) => `/api/v1/reports/species/${species}`,
        UPLOAD_IMAGE: '/api/v1/reports/upload-photo',
    }
}