import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { API_URL, getImageUrl } from "../config";

function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/sellers/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Seller not found");
        return r.json();
      })
      .then((data) => {
        setSeller(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <h2 className="cars-message">Loading seller...</h2>;
  if (error) return <h2 className="cars-message">{error}</h2>;

  return (
    <div className="cars-page">
      <Link to="/cars" className="back-link">← Back to Cars</Link>

      <div className="seller-header">
        <div className="seller-avatar">{seller.name.charAt(0).toUpperCase()}</div>
        <div>
          <h1>{seller.name}</h1>
          <p className="cars-subtitle">
            {seller.joined && `Member since ${seller.joined} • `}
            {seller.active_count} active • {seller.sold_count} sold
          </p>
        </div>
      </div>

      {seller.cars.length === 0 ? (
        <div className="empty-cars">
          <h2>This seller has no listings</h2>
        </div>
      ) : (
        <div className="cars-grid">
          {seller.cars.map((car) => (
            <div className="car-card" key={car.id}>
              <div className="car-card-image">
                {car.image ? (
                  <img src={getImageUrl(car.image)} alt={`${car.brand} ${car.model}`} />
                ) : (
                  <span>🚗</span>
                )}
                {car.status === "sold" && <span className="sold-badge">SOLD</span>}
              </div>

              <div className="car-card-content">
                <h2>{car.brand.trim()} {car.model}</h2>
                <h3>PKR {Number(car.price).toLocaleString()}</h3>
                <p>
                  {car.year} •{" "}
                  {car.condition === "new"
                    ? "Brand New"
                    : `${Number(car.mileage).toLocaleString()} km`}
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

export default SellerProfile;