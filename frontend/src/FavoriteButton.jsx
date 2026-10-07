import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";
import { useFavorites } from "./FavoritesContext";

function FavoriteButton({ car }) {
  const { token } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const saved = isFavorite(car.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      navigate("/login");
      return;
    }

    toggleFavorite(car);
  };

  return (
    <button
      type="button"
      className={`fav-btn ${saved ? "saved" : ""}`}
      onClick={handleClick}
      title={saved ? "Remove from saved" : "Save this car"}
    >
      {saved ? "❤️" : "🤍"}
    </button>
  );
}

export default FavoriteButton;