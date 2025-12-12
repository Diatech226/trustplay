export const uploadImageFile = async (file, apiUrl) => {
  if (!file) {
    throw new Error('Aucun fichier sélectionné');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image.');
  }

  const maxSizeInMb = 5;
  if (file.size > maxSizeInMb * 1024 * 1024) {
    throw new Error(`L'image doit faire moins de ${maxSizeInMb} Mo.`);
  }

  const formData = new FormData();
  // La plupart des backends attendent soit "image" soit "file" pour le champ binaire.
  formData.append('image', file);
  formData.append('file', file);

  const res = await fetch(`${apiUrl}/api/uploads`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "L'upload de l'image a échoué.");
  }

  const payload = data.data || data;
  const imageUrl =
    payload.url ||
    payload.imageUrl ||
    payload.image ||
    payload.location ||
    payload.secure_url ||
    payload.id;

  if (!imageUrl) {
    throw new Error("Impossible de récupérer l'URL de l'image renvoyée par l'API.");
  }

  return imageUrl;
};
