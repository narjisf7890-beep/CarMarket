import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getImageUrl, getWhatsAppLink } from "./config";
import { useAuth } from "./AuthContext";

function CarLightbox({ car, onClose }) {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);

  const images =
    car.images && car.images.length > 0
      ? car.images.map((i) => getImageUrl(i.url))
      : car.image
      ? [getImageUrl(car.image)]
      : [];

  const media = [
    ...images.map((src) => ({ type: "image", src })),
    ...(car.video ? [{ type: "video", src: getImageUrl(car.video) }] : []),
  ];
  const count = media.length;
  const current = media[Math.min(index, count - 1)];

  const go = (step) => setIndex((i) => (i + step + count) % count);

  // Esc closes, arrow keys change slides, page behind does not scroll
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (count > 1 && e.key === "ArrowLeft") go(-1);
      if (count > 1 && e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [count]);

  const isOwner = user && car.seller_id === user.id;
  const isSold = car.status === "sold";

  const details = [
    ["Year", car.year],
    ["Condition", car.condition === "new" ? "New" : "Used"],
    ...(car.condition !== "new"
      ? [["Mileage", `${Number(car.mileage).toLocaleString()} km`]]
      : []),
    ["Fuel", car.fuel_type],
    ["Transmission", car.transmission],
    ["Body Type", car.body_type],
    ["Paint", car.paint],
    ["City", car.city],
    ["Seller", car.seller_name],
  ].filter(([, value]) => value);

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lightbox-close" onClick={onClose}>
          ×
        </button>

        <div className="lightbox-media">
          <div className="lightbox-stage">
            {current ? (
              current.type === "video" ? (
                <video key={current.src} src={current.src} controls autoPlay />
              ) : (
                <img src={current.src} alt={`${car.brand} ${car.model}`} />
              )
            ) : (
              <div className="no-image">🚗</div>
            )}

            {count > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-arrow left"
                  onClick={() => go(-1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="gallery-arrow right"
                  onClick={() => go(1)}
                >
                  ›
                </button>
                <span className="gallery-count">
                  {Math.min(index, count - 1) + 1} / {count}
                </span>
              </>
            )}
          </div>

          {count > 1 && (
            <div className="lightbox-thumbs">
              {media.map((m, n) => (
                <button
                  type="button"
                  key={n}
                  className={n === index ? "active" : ""}
                  onClick={() => setIndex(n)}
                >
                  {m.type === "video" ? <span>▶</span> : <img src={m.src} alt="" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lightbox-info">
          <h2>
            {car.brand.trim()} {car.model}
          </h2>
          <p className="lightbox-price">
            PKR {Number(car.price).toLocaleString()}
            {isSold && <span className="sold-inline">SOLD</span>}
          </p>

          <div className="lightbox-specs">
            {details.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong style={{ textTransform: label === "City" ? "capitalize" : "none" }}>
                  {value}
                </strong>
              </div>
            ))}
          </div>

          <h3>Description</h3>
          <p className="lightbox-desc">{car.description || "No description provided."}</p>

          <div className="lightbox-actions">
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
                  💬 WhatsApp
                </a>
                <a className="contact-button" href={`tel:${car.seller_phone}`}>
                  📞 Call
                </a>
              </>
            )}
            <Link to={`/cars/${car.id}`} className="view-details-button" onClick={onClose}>
              Open full page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarLightbox;