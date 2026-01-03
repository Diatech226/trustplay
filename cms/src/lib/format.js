export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const formatTags = (tags) => {
  if (!tags || !tags.length) return '—';
  return tags.join(', ');
};
