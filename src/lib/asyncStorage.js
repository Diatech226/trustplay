const asyncStorage = {
  async getItem(key) {
    const value = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    return Promise.resolve(value);
  },
  async setItem(key, value) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
    return Promise.resolve();
  },
  async removeItem(key) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
    return Promise.resolve();
  },
};

export default asyncStorage;
