import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL, getImageUrl } from "../config";
import { useAuth } from "../AuthContext";

function MyListings() {
  const { token } = useAuth();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/my-cars`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load your listings");
        }
        return response.json();
      })
      .then((data) => {
        setCars(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const toggleSold = async (car) => {
    const newStatus = car.status === "sold" ? "available" : "sold";
    const response = await fetch(`${API_URL}/api/cars/${car.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (response.ok) {
      setCars((prev) =>
        prev.map((c) => (c.id === car.id ? { ...c, status: newStatus } : c))
      );
    }
  };

  if (!token) {
    return (
      <div className="cars-page">
        <h1>My Listings</h1>
        <p>Please login to see your listings.</p>
        <p>
          <Link to="/login">Login</Link> | <Link to="/signup">Sign up</Link>
        </p>
      </div>
    );
  }

  if (loading) {
    return <h2 className="cars-message">Loading your listings...</h2>;
  }

  if (error) {
    return <h2 className="cars-message">{error}</h2>;
  }

  return (
    <div className="cars-page">
      <h1>My Listings</h1>

      <p className="cars-subtitle">Cars you have listed for sale.</p>

      {cars.length === 0 ? (
        <div className="empty-cars">
          <h2>You have not listed any cars yet</h2>

          <Link to="/sell" className="sell-link">
            Sell Your Car
          </Link>
        </div>
      ) : (
        <div className="cars-grid">
          {cars.map((car) => (
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
                {car.status === "sold" && (
                  <span className="sold-badge">SOLD</span>
                )}
                {car.condition === "new" && (
                  <span className="condition-badge">NEW</span>
                )}
              </div>

              <div className="car-card-content">
                <h2>
                  {car.brand.trim()} {car.model}
                </h2>

                <h3>PKR {Number(car.price).toLocaleString()}</h3>

                <p>
                  {car.year} •{" "}
                  {car.condition === "new"
                    ? "Brand New"
                    : `${Number(car.mileage).toLocaleString()} km`}
                </p>

                <p style={{ textTransform: "capitalize" }}>📍 {car.city}</p>

                <p>👁 {car.views || 0} views</p>

                <Link
                  to={`/cars/${car.id}`}
                  className="view-details-button"
                >
                  View Details
                </Link>

                <button onClick={() => toggleSold(car)}>
                  {car.status === "sold" ? "Mark as Available" : "Mark as Sold"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyListings;