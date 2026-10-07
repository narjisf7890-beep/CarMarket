import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { API_URL } from "../config";
import { useAuth } from "../AuthContext";
import { SearchIcon, CarIcon, ChatIcon } from "../Icons";
import HeroSlider from "../HeroSlider";
import ServicesSection from "../ServicesSection";
import CarCard from "../CarCard";
import { cityNames } from "../locations";

const brandNames = [
  "Toyota", "Honda", "Suzuki", "Kia", "Hyundai", "Changan", "MG", "Nissan",
  "Daihatsu", "Mitsubishi", "Mazda", "Subaru", "Isuzu", "Lexus",
  "Audi", "BMW", "Mercedes-Benz", "Volkswagen", "Volvo", "Porsche",
  "Land Rover", "Range Rover", "Jeep", "Ford", "Chevrolet", "Tesla",
  "Peugeot", "Proton", "DFSK", "FAW", "Haval", "BAIC", "JAC", "Prince",
  "United", "Daewoo", "BYD", "Chery", "Jetour", "GAC", "Hino", "Honri",
];

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const brands = brandNames.map((name) => ({
  name,
  logo: `/brands/${slugify(name)}.png`,
}));

const INITIAL_BRANDS = 16;

function BrandLogo({ brand }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="hp-brand-fallback">{brand.name[0]}</span>;
  }

  return (
    <img
      src={brand.logo}
      alt={brand.name}
      className="hp-brand-logo"
      onError={() => setFailed(true)}
    />
  );
}

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const visibleBrands = showAllBrands ? brands : brands.slice(0, INITIAL_BRANDS);

  const [latestCars, setLatestCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);

  useEffect(() => {
    // Only the 6 newest cars; sold cars are hidden by the backend
    fetch(`${API_URL}/api/cars?page=1&per_page=6&sort=newest`)
      .then((response) => response.json())
      .then((data) => {
        setLatestCars(Array.isArray(data.cars) ? data.cars : []);
        setLoadingCars(false);
      })
      .catch(() => setLoadingCars(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (city) params.set("city", city.toLowerCase());
    if (maxPrice) params.set("maxPrice", maxPrice);

    const query = params.toString();
    navigate(query ? `/cars?${query}` : "/cars");
  };

  return (
    <div className="hp">
      {/* Hero */}
      <section className="hp-hero">
        <HeroSlider />

        <div className="hp-hero-inner">
          <form className="hp-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search brand or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All Cities</option>
              {cityNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              placeholder="Max price (PKR)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />

            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      {/* Popular brands */}
      <section className="hp-section">
        <div className="hp-section-head">
          <h2>Popular Brands</h2>
          <button
            type="button"
            className="hp-link-button"
            onClick={() => setShowAllBrands(!showAllBrands)}
          >
            {showAllBrands ? "Show less" : `View all ${brands.length} brands →`}
          </button>
        </div>

        <div className="hp-brands">
          {visibleBrands.map((brand) => (
            <Link
              key={brand.name}
              to={`/cars?search=${encodeURIComponent(brand.name)}`}
              className="hp-brand"
            >
              <BrandLogo brand={brand} />
              <strong>{brand.name}</strong>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest cars */}
      <section className="hp-section">
        <div className="hp-section-head">
          <h2>Latest Cars</h2>
          <Link to="/cars">View all →</Link>
        </div>

        {loadingCars ? (
          <p className="hp-muted">Loading cars...</p>
        ) : latestCars.length === 0 ? (
          <div className="empty-cars">
            <h3>No cars listed yet</h3>
            <p>Be the first person to sell a car!</p>
            <Link to="/sell" className="sell-link">
              Sell Your Car
            </Link>
          </div>
        ) : (
          <div className="cars-grid">
            {latestCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      {/* Services */}
      <ServicesSection />

      {/* Why CarMarket */}
      <section className="hp-section">
        <div className="hp-features">
          <div className="hp-feature">
            <div className="hp-icon">
              <SearchIcon />
            </div>
            <h3>Easy Search</h3>
            <p>Find cars by brand, model, price and city.</p>
          </div>

          <div className="hp-feature">
            <div className="hp-icon">
              <CarIcon />
            </div>
            <h3>Many Cars</h3>
            <p>Browse cars listed by different sellers.</p>
          </div>

          <div className="hp-feature">
            <div className="hp-icon">
              <ChatIcon />
            </div>
            <h3>Contact on WhatsApp</h3>
            <p>Message or call the seller directly.</p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="hp-cta">
        <h2>Sell your car today</h2>
        <p>List your car in a minute and reach thousands of buyers.</p>

        <Link to={user ? "/sell" : "/signup"} className="hp-cta-button">
          {user ? "Sell Your Car" : "Create Free Account"}
        </Link>
      </section>
    </div>
  );
}

export default Home;