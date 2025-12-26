import { uploadFile } from '../lib/apiClient';

export const uploadImageFile = async (file) => {
  if (!file) {
    throw new Error('Aucun fichier sélectionné');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image.');
  }

  const maxSizeInMb = 10;
  if (file.size > maxSizeInMb * 1024 * 1024) {
    throw new Error(`L'image doit faire moins de ${maxSizeInMb} Mo.`);
  }

  const uploaded = await uploadFile(file, 'file');
  return uploaded;
};

export const uploadMediaFile = async (file) => {
  if (!file) {
    throw new Error('Aucun fichier sélectionné');
  }

  const uploaded = await uploadFile(file, 'file');
  return uploaded;
};
