import { Link } from "react-router";
import { getImageUrl } from "../config";
import { useAuth } from "../AuthContext";
import { useFavorites } from "../FavoritesContext";
import FavoriteButton from "../FavoriteButton";

function SavedCars() {
  const { token } = useAuth();
  const { favoriteCars } = useFavorites();

  if (!token) {
    return (
      <div className="cars-page">
        <h1>Saved Cars</h1>
        <p>Please login to see your saved cars.</p>
        <p>
          <Link to="/login">Login</Link> | <Link to="/signup">Sign up</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="cars-page">
      <h1>Saved Cars</h1>
      <p className="cars-subtitle">Cars you have saved for later.</p>

      {favoriteCars.length === 0 ? (
        <div className="empty-cars">
          <h2>No saved cars yet</h2>
          <p>Tap the 🤍 on any car to save it here.</p>
          <Link to="/cars" className="sell-link">
            Browse Cars
          </Link>
        </div>
      ) : (
        <div className="cars-grid">
          {favoriteCars.map((car) => (
            <div className="car-card" key={car.id}>
              <div className="car-card-image">
                {car.image ? (
                  <img
                    src={getImageUrl(car.image)}
                    alt={`${car.brand} ${car.model}`}
                  />
                ) : (
                  <span>🚗</span>
                )}
                <FavoriteButton car={car} />
              </div>

              <div className="car-card-content">
                <h2>
                  {car.brand.trim()} {car.model}
                </h2>
                <h3>PKR {Number(car.price).toLocaleString()}</h3>
                <p>
                  {car.year} • {Number(car.mileage).toLocaleString()} km
                </p>
                <p style={{ textTransform: "capitalize" }}>📍 {car.city}</p>

                <Link to={`/cars/${car.id}`} className="view-details-button">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedCars;