import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/hero/slide1.jpg",
    title: "Find Your Perfect Car",
    text: "Buy and sell cars easily with CarMarket.",
  },
  {
    image: "/hero/slide2.jpg",
    title: "Thousands of Verified Listings",
    text: "Photos, videos and full details on every car.",
  },
  {
    image: "/hero/slide3.jpg",
    title: "Sell Your Car in Minutes",
    text: "List your car for free and reach real buyers.",
  },
];

const INTERVAL = 5000;

function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      INTERVAL
    );
    return () => clearInterval(timer);
  }, [paused]);

  const go = (step) =>
    setIndex((i) => (i + step + slides.length) % slides.length);

  return (
    <div
      className="hero-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-bg">
        {slides.map((s, n) => (
          <div
            key={s.image}
            className={`hero-slide hero-slide-${n + 1} ${n === index ? "active" : ""}`}
            style={{ backgroundImage: `url(${s.image})` }}
          />
        ))}
        <div className="hero-overlay" />
      </div>

      <div className="hero-text" key={index}>
        <h1>{slides[index].title}</h1>
        <p>{slides[index].text}</p>
      </div>

      <button type="button" className="hero-arrow left" onClick={() => go(-1)} aria-label="Previous slide">
        <ChevronLeft size={26} />
      </button>
      <button type="button" className="hero-arrow right" onClick={() => go(1)} aria-label="Next slide">
        <ChevronRight size={26} />
      </button>

      <div className="hero-dots">
        {slides.map((_, n) => (
          <button
            type="button"
            key={n}
            className={n === index ? "active" : ""}
            onClick={() => setIndex(n)}
            aria-label={`Go to slide ${n + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSlider;