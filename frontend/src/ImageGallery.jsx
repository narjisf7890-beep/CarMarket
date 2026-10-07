import { useState } from "react";

function ImageGallery({ images, alt, children }) {
  const [index, setIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="gallery-main">
        <div className="no-image">🚗</div>
        {children}
      </div>
    );
  }

  const i = Math.min(index, images.length - 1);
  const prev = () => setIndex((i - 1 + images.length) % images.length);
  const next = () => setIndex((i + 1) % images.length);

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={images[i]} alt={alt} />

        {images.length > 1 && (
          <>
            <button type="button" className="gallery-arrow left" onClick={prev}>
              ‹
            </button>
            <button type="button" className="gallery-arrow right" onClick={next}>
              ›
            </button>
            <span className="gallery-count">
              {i + 1} / {images.length}
            </span>
          </>
        )}

        {children}
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((src, n) => (
            <img
              key={n}
              src={src}
              alt=""
              className={n === i ? "active" : ""}
              onClick={() => setIndex(n)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;