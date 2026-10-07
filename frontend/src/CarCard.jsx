import { useState } from "react";
import { Link } from "react-router";
import { getImageUrl } from "./config";
import FavoriteButton from "./FavoriteButton";
import CarLightbox from "./CarLightbox";

function CarCard({ car, children }) {
  const [open, setOpen] = useState(false);

  const chips = [
    car.condition === "new"
      ? "Brand New"
      : `${Number(car.mileage).toLocaleString()} km`,
    car.fuel_type,
    car.transmission,
    car.body_type,
    car.paint,
  ].filter(Boolean);

  return (
    <div className="car-card">
      <div className="car-card-image">
        <button
          type="button"
          className="card-image-btn"
          onClick={() => setOpen(true)}
          aria-label={`Open ${car.brand} ${car.model} photos and details`}
        >
          {car.image ? (
            <img src={getImageUrl(car.image)} alt={`${car.brand} ${car.model}`} />
          ) : (
            <span>🚗</span>
          )}
        </button>

        {car.status === "sold" && <span className="sold-badge">SOLD</span>}
        {car.condition === "new" && <span className="condition-badge">NEW</span>}
        {(car.images?.length > 1 || car.video) && (
          <span className="media-count">
            📷 {car.images?.length || 1}
            {car.video ? " • 🎥" : ""}
          </span>
        )}
        <FavoriteButton car={car} />
      </div>

      <div className="car-card-content">
        <h2>
          {car.brand.trim()} {car.model}
        </h2>

        <h3>PKR {Number(car.price).toLocaleString()}</h3>

        <p>
          {car.year} • <span style={{ textTransform: "capitalize" }}>📍 {car.city}</span>
        </p>

        <div className="spec-chips">
          {chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>

        {car.description && <p className="card-desc">{car.description}</p>}

        <Link to={`/cars/${car.id}`} className="view-details-button">
          View Details
        </Link>

        {children}
      </div>

      {open && <CarLightbox car={car} onClose={() => setOpen(false)} />}
    </div>
  );
}

export default CarCard;