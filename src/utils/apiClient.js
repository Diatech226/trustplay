const logError = (message, details) => {
  console.error(`[API] ${message}`, details);
};

export async function fetchJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      logError('Requête échouée', { status: response.status, url, body: data });
      throw new Error(data?.message || 'Une erreur est survenue lors du chargement des données');
    }

    return data;
  } catch (error) {
    logError('Exception réseau', { url, message: error.message });
    throw error;
  }
}
