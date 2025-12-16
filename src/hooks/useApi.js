import { useState } from 'react';

export const useApi = (fn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(...args);
      return res;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { call, loading, error };
};
