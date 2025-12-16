import React, { createContext, useContext, useEffect, useState } from 'react';
import { weddingService } from '../services/weddings';

const WeddingContext = createContext(null);

export const WeddingProvider = ({ children }) => {
  const [weddings, setWeddings] = useState([]);
  const [selectedWedding, setSelectedWedding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));

  const loadWeddings = async () => {
    // Only load weddings if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await weddingService.getMyWeddings();
      const weddingList = res?.weddings || [];
      setWeddings(weddingList);

      // Get previously selected wedding ID from localStorage
      const savedWeddingId = localStorage.getItem('selectedWeddingId');
      
      if (savedWeddingId && weddingList.length > 0) {
        // Try to find the saved wedding
        const savedWedding = weddingList.find(w => w._id === savedWeddingId);
        setSelectedWedding(savedWedding || weddingList[0]);
      } else if (weddingList.length > 0) {
        // Select the first wedding by default
        setSelectedWedding(weddingList[0]);
      } else {
        setSelectedWedding(null);
      }
    } catch (err) {
      console.error('Error loading weddings:', err);
      setWeddings([]);
      setSelectedWedding(null);
    } finally {
      setLoading(false);
    }
  };

  const selectWedding = (wedding) => {
    setSelectedWedding(wedding);
    if (wedding) {
      localStorage.setItem('selectedWeddingId', wedding._id);
    } else {
      localStorage.removeItem('selectedWeddingId');
    }
  };

  const addWedding = (newWedding) => {
    setWeddings(prev => [newWedding, ...prev]);
    selectWedding(newWedding);
  };

  const removeWedding = (weddingId) => {
    setWeddings(prev => prev.filter(w => w._id !== weddingId));
    if (selectedWedding?._id === weddingId) {
      const remaining = weddings.filter(w => w._id !== weddingId);
      setSelectedWedding(remaining[0] || null);
    }
  };

  const updateWedding = (updatedWedding) => {
    setWeddings(prev => prev.map(w => w._id === updatedWedding._id ? updatedWedding : w));
    if (selectedWedding?._id === updatedWedding._id) {
      setSelectedWedding(updatedWedding);
    }
  };

  useEffect(() => {
    // Listen for custom auth change event
    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      setAuthToken(token);
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  useEffect(() => {
    // Reload weddings when auth token changes
    if (authToken) {
      loadWeddings();
    } else {
      // Clear weddings when user logs out
      setWeddings([]);
      setSelectedWedding(null);
      setLoading(false);
    }
  }, [authToken]);

  // Backward compatibility - keep 'wedding' for existing code
  const wedding = selectedWedding;
  const setWedding = setSelectedWedding;
  const reloadWedding = loadWeddings;

  return (
    <WeddingContext.Provider value={{ 
      // New multi-wedding properties
      weddings,
      selectedWedding,
      selectWedding,
      addWedding,
      removeWedding,
      updateWedding,
      loading,
      reloadWeddings: loadWeddings,
      
      // Backward compatibility
      wedding,
      setWedding,
      reloadWedding
    }}>
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => useContext(WeddingContext);
