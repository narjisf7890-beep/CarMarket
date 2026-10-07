import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "./config";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { token } = useAuth();
  const [favoriteCars, setFavoriteCars] = useState([]);

  useEffect(() => {
    if (!token) {
      setFavoriteCars([]);
      return;
    }

    fetch(`${API_URL}/api/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setFavoriteCars(Array.isArray(data) ? data : []))
      .catch(() => setFavoriteCars([]));
  }, [token]);

  const isFavorite = (carId) => favoriteCars.some((c) => c.id === carId);

  const toggleFavorite = async (car) => {
    const saved = isFavorite(car.id);

    setFavoriteCars((prev) =>
      saved ? prev.filter((c) => c.id !== car.id) : [car, ...prev]
    );

    try {
      await fetch(`${API_URL}/api/favorites/${car.id}`, {
        method: saved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setFavoriteCars((prev) =>
        saved ? [car, ...prev] : prev.filter((c) => c.id !== car.id)
      );
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favoriteCars, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}