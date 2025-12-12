import { store } from '../redux/store';

export const API_BASE_URL =
  import.meta.env?.NEXT_PUBLIC_API_URL ||
  import.meta.env?.VITE_API_URL ||
  'http://localhost:3000';

const buildUrl = (path) => {
  if (path.startsWith('http')) return path;
  if (!path.startsWith('/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path}`;
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

export const getAuthToken = () => {
  const state = store.getState?.();
  const tokenFromStore = state?.user?.currentUser?.token || state?.user?.currentUser?.data?.token;
  const tokenFromStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  return tokenFromStore || tokenFromStorage || state?.user?.currentUser?.accessToken;
};

const normalizeUploadResponse = (payload) => {
  if (!payload) return null;
  const data = payload.data || payload;
  return {
    ...data,
    url: data.url || data.location || data.path,
    name: data.name || data.filename,
    mime: data.mime || data.mimetype,
  };
};

export async function apiRequest(path, { method = 'GET', body, headers = {}, auth = false, ...rest } = {}) {
  try {
    const config = {
      method,
      headers: {
        ...headers,
      },
      credentials: 'include',
      ...rest,
    };

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    if (body !== undefined) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    if (!isFormData) {
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
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

export async function uploadFile(file, fieldName = 'file') {
  if (!file) {
    throw new Error('Aucun fichier sélectionné');
  }

  const formData = new FormData();
  formData.append(fieldName, file);
  // Compat: certains anciens backends attendent le champ "file" par défaut
  if (fieldName !== 'file') {
    formData.append('file', file);
  }

  const response = await apiRequest('/api/uploads', {
    method: 'POST',
    body: formData,
    auth: true,
  });

  const normalized = normalizeUploadResponse(response);
  if (!normalized?.url) {
    throw new Error("Impossible de récupérer l'URL de fichier");
  }

  return normalized;
}
