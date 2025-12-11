const API_URL = import.meta.env.VITE_API_URL;

const buildUrl = (path) => {
  if (path.startsWith('http')) return path;
  if (!path.startsWith('/')) return `${API_URL}/${path}`;
  return `${API_URL}${path}`;
};

const logError = (message, details) => {
  console.error(`[API] ${message}`, details);
};

const parseResponse = async (response) => {
  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    // Body not json
  }

  if (!response.ok) {
    const errorMessage = data?.message || `Requête échouée (${response.status})`;
    logError(errorMessage, { status: response.status, url: response.url, body: data });
    throw new Error(errorMessage);
  }

  // Normalize success flag
  if (data && typeof data === 'object' && !('success' in data)) {
    data.success = true;
  }

  return data;
};

export const getAuthToken = () => localStorage.getItem('token');

export async function apiRequest(path, { method = 'GET', body, headers = {}, auth = false, ...rest } = {}) {
  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include',
      ...rest,
    };

    if (body !== undefined) {
      config.body = JSON.stringify(body);
    }

    if (auth) {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(buildUrl(path), config);
    return await parseResponse(response);
  } catch (error) {
    logError('Exception réseau', { path, message: error.message });
    throw error;
  }
}

export async function fetchJson(url, options = {}) {
  return apiRequest(url, options);
}
