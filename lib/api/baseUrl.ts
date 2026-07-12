const configuredBackendUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  ?.trim()
  .replace(/\/+$/, '');

export const API_BASE_URL = configuredBackendUrl
  ? configuredBackendUrl.endsWith('/api/v1')
    ? configuredBackendUrl
    : `${configuredBackendUrl}/api/v1`
  : '/backend/api/v1';
