export const getAdminEmailSet = () => {
  const raw = process.env.ADMIN_EMAILS || '';
  const entries = raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return new Set(entries);
};

export const isAdminEmail = (email, adminEmailSet) => {
  if (!email) return false;
  const normalized = String(email).trim().toLowerCase();
  if (!normalized) return false;
  const set = adminEmailSet || getAdminEmailSet();
  return set.has(normalized);
};
