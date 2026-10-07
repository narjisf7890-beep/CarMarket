import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { API_URL, getImageUrl, getWhatsAppLink } from "../config";
import { useAuth } from "../AuthContext";
import FavoriteButton from "../FavoriteButton";
import ImageGallery from "../ImageGallery";

function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [similar, setSimilar] = useState([]);

  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [reportMsg, setReportMsg] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/cars/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Car not found");
        }
        return response.json();
      })
      .then((data) => {
        setCar(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // View counter: the owner's views are not counted, and each visitor
  // is counted once per browser session
  useEffect(() => {
    if (!car) return;
    if (user && car.seller_id === user.id) return;
    const key = `viewed_${car.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`${API_URL}/api/cars/${car.id}/view`, { method: "POST" }).catch(
      () => {}
    );
  }, [car?.id, user?.id]);

  useEffect(() => {
    fetch(`${API_URL}/api/cars/${id}/similar`)
      .then((r) => r.json())
      .then(setSimilar)
      .catch(() => setSimilar([]));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this car?")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`${API_URL}/api/cars/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || "Failed to delete car");
      }

      alert("Car deleted successfully!");
      navigate("/cars");
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  };

  const toggleSold = async () => {
    const newStatus = car.status === "sold" ? "available" : "sold";
    const response = await fetch(`${API_URL}/api/cars/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (response.ok) setCar({ ...car, status: newStatus });
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setReportMsg("");
    try {
      const response = await fetch(`${API_URL}/api/cars/${id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason, details }),
      });
      const data = await response.json();
      setReportMsg(data.message || "Done");
      if (response.ok) {
        setShowReport(false);
        setReason("");
        setDetails("");
      }
    } catch {
      setReportMsg("Network error, please try again");
    }
  };

  if (loading) {
    return <h2 className="details-message">Loading car details...</h2>;
  }

  if (error) {
    return (
      <div className="details-message">
        <h2>{error}</h2>
        <Link to="/cars">← Back to Cars</Link>
      </div>
    );
  }

  const isOwner = user && car.seller_id === user.id;
  const isSold = car.status === "sold";
  const galleryImages = (car.images || []).map((img) => getImageUrl(img.url));

  return (
    <div className="car-details-page">
      <Link to="/cars" className="back-link">
        ← Back to Cars
      </Link>

      <div className="car-details-card">
        <div className="car-image-section">
          <ImageGallery
            key={car.id}
            images={galleryImages}
            alt={`${car.brand} ${car.model}`}
          >
            {isSold && <span className="sold-badge">SOLD</span>}
            <FavoriteButton car={car} />
          </ImageGallery>
        </div>
                  {car.video && (
            <div className="video-section">
              <h3>🎥 Car Video</h3>
              <video
                src={getImageUrl(car.video)}
                controls
                preload="metadata"
                className="car-video"
              />
            </div>
          )}
        <div className="car-info-section">
          <h1>
            {car.brand.trim()} {car.model}
          </h1>

          <h2 className="car-price">
            PKR {Number(car.price).toLocaleString()}
          </h2>

          <div className="car-info-grid">
            <div>
              <span>Year</span>
              <strong>{car.year}</strong>
            </div>
                    {car.paint && (
              <div>
                <span>Paint</span>
                <strong>{car.paint}</strong>
              </div>
            )}
            <div>
              <span>Condition</span>
              <strong>{car.condition === "new" ? "New" : "Used"}</strong>
            </div>

            {car.condition !== "new" && (
              <div>
                <span>Mileage</span>
                <strong>{Number(car.mileage).toLocaleString()} km</strong>
              </div>
            )}

            <div>
              <span>City</span>
              <strong style={{ textTransform: "capitalize" }}>
                {car.city}
              </strong>
            </div>

            <div>
              <span>Brand</span>
              <strong>{car.brand.trim()}</strong>
            </div>

            {car.fuel_type && (
              <div>
                <span>Fuel</span>
                <strong>{car.fuel_type}</strong>
              </div>
            )}

            {car.transmission && (
              <div>
                <span>Transmission</span>
                <strong>{car.transmission}</strong>
              </div>
            )}

            {car.body_type && (
              <div>
                <span>Body Type</span>
                <strong>{car.body_type}</strong>
              </div>
            )}

            {car.seller_name && (
              <div>
                <span>Seller</span>
                <strong>
                  <Link to={`/sellers/${car.seller_id}`}>{car.seller_name}</Link>
                </strong>
              </div>
            )}

            {isOwner && (
              <div>
                <span>Views</span>
                <strong>👁 {car.views || 0}</strong>
              </div>
            )}
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>{car.description || "No description provided."}</p>
          </div>

          <div className="car-actions">
            {isOwner && (
              <>
                <button className="edit-button" onClick={toggleSold}>
                  {isSold ? "↩️ Mark as Available" : "✅ Mark as Sold"}
                </button>

                <button
                  className="edit-button"
                  onClick={() => navigate(`/cars/${car.id}/edit`)}
                >
                  ✏️ Edit Car
                </button>

                <button
                  className="delete-button"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "🗑️ Delete Car"}
                </button>
              </>
            )}

            {!isOwner && isSold && (
              <p>
                <strong>This car has been sold.</strong>
              </p>
            )}

            {!isOwner && !isSold && car.seller_phone && (
              <>
                <a
                  className="contact-button"
                  href={getWhatsAppLink(
                    car.seller_phone,
                    `Hi, I am interested in your ${car.brand.trim()} ${car.model} (${car.year}) listed on CarMarket.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  💬 WhatsApp Seller
                </a>

                <a className="contact-button" href={`tel:${car.seller_phone}`}>
                  📞 Call {car.seller_phone}
                </a>
              </>
            )}
          </div>

          {!isOwner && token && (
            <div className="report-box">
              {!showReport ? (
                <button
                  type="button"
                  className="report-link"
                  onClick={() => setShowReport(true)}
                >
                  🚩 Report this listing
                </button>
              ) : (
                <form onSubmit={submitReport} className="report-form">
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="fake">Fake listing</option>
                    <option value="wrong_info">Incorrect information</option>
                    <option value="scam">Suspected fraud / scam</option>
                    <option value="sold">Already sold</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    placeholder="Details (optional, max 500 characters)"
                    maxLength={500}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                  <div>
                    <button type="submit">Submit Report</button>{" "}
                    <button type="button" onClick={() => setShowReport(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              {reportMsg && <p>{reportMsg}</p>}
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <div className="similar-section">
          <h2>Similar Cars</h2>
          <div className="similar-grid">
            {similar.map((c) => (
              <Link to={`/cars/${c.id}`} className="similar-card" key={c.id}>
                {c.image ? (
                  <img
                    src={getImageUrl(c.image)}
                    alt={`${c.brand} ${c.model}`}
                  />
                ) : (
                  <div className="similar-noimg">🚗</div>
                )}
                <div className="similar-info">
                  <strong>
                    {c.brand.trim()} {c.model}
                  </strong>
                  <span>PKR {Number(c.price).toLocaleString()}</span>
                  <small style={{ textTransform: "capitalize" }}>
                    {c.year} • {c.city}
                  </small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CarDetails;