import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { API_URL } from "./config";
import CarCard from "./CarCard";
import { getAreas } from "./locations";

const PAGE_SIZE = 9;
const capitalize = (text) => text.replace(/\b\w/g, (c) => c.toUpperCase());

function ViewCars() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || "";
  const area = searchParams.get("area") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const fuel = searchParams.get("fuel_type") || "";
  const transmission = searchParams.get("transmission") || "";
  const bodyType = searchParams.get("body_type") || "";
  const condition = searchParams.get("condition") || "";
  const sortBy = searchParams.get("sort") || "newest";
  const showSold = searchParams.get("sold") === "1";
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [priceInput, setPriceInput] = useState(maxPrice);
  const [cities, setCities] = useState([]);
  const [result, setResult] = useState({ cars: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Updates one URL parameter; changing a filter resets to page 1
  const setParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      return next;
    });
  };

  // Changing the city also clears the selected area
  const changeCity = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set("city", value);
      else next.delete("city");
      next.delete("area");
      next.delete("page");
      return next;
    });
  };

  // Debounce typing: update the URL 0.4s after the user stops typing
  useEffect(() => {
    if (searchInput === search) return;
    const t = setTimeout(() => setParam("search", searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (priceInput === maxPrice) return;
    const t = setTimeout(() => setParam("maxPrice", priceInput), 400);
    return () => clearTimeout(t);
  }, [priceInput]);

  // Keep the input boxes in sync with the URL (back button, Clear Filters)
  useEffect(() => setSearchInput(search), [search]);
  useEffect(() => setPriceInput(maxPrice), [maxPrice]);

  useEffect(() => {
    fetch(`${API_URL}/api/cities`)
      .then((r) => r.json())
      .then(setCities)
      .catch(() => {});
  }, []);

  const queryString = searchParams.toString();

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams({
      page: String(page),
      per_page: String(PAGE_SIZE),
      sort: sortBy,
    });
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (area) params.set("area", area);
    if (maxPrice) params.set("max_price", maxPrice);
    if (fuel) params.set("fuel_type", fuel);
    if (transmission) params.set("transmission", transmission);
    if (bodyType) params.set("body_type", bodyType);
    if (condition) params.set("condition", condition);
    if (showSold) params.set("sold", "1");

    setLoading(true);
    setError("");

    fetch(`${API_URL}/api/cars?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load cars");
        return response.json();
      })
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [queryString]);

  const goToPage = (number) => {
    setParam("page", number === 1 ? "" : String(number));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasFilters =
    search || city || area || maxPrice || fuel || transmission || bodyType || condition || showSold;

  const { cars, total, pages } = result;
  const currentPage = result.page;

  return (
    <div className="cars-page">
      <h1>Cars for Sale</h1>

      <p className="cars-subtitle">
        Find your next car from our available listings.
      </p>

      <div className="condition-tabs">
        {[
          ["", "All Cars"],
          ["used", "Used Cars"],
          ["new", "New Cars"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={condition === value ? "active" : ""}
            onClick={() => setParam("condition", value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="filters-box">
        <input
          type="text"
          placeholder="Search by brand or model..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select value={city} onChange={(e) => changeCity(e.target.value)}>
          <option value="">All Cities</option>
          {cities.map((cityName) => (
            <option key={cityName} value={cityName}>
              {capitalize(cityName)}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Maximum price"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
        />

        <button
          className="clear-filter-button"
          onClick={() => setSearchParams({})}
        >
          Clear Filters
        </button>
      </div>

      <div className="filters-box filters-row2">
        <select value={fuel} onChange={(e) => setParam("fuel_type", e.target.value)}>
          <option value="">All Fuel Types</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Hybrid">Hybrid</option>
          <option value="CNG">CNG</option>
          <option value="Electric">Electric</option>
        </select>

        <select
          value={transmission}
          onChange={(e) => setParam("transmission", e.target.value)}
        >
          <option value="">All Transmissions</option>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
        </select>

        <select value={bodyType} onChange={(e) => setParam("body_type", e.target.value)}>
          <option value="">All Body Types</option>
          <option value="Sedan">Sedan</option>
          <option value="Hatchback">Hatchback</option>
          <option value="SUV">SUV</option>
          <option value="Crossover">Crossover</option>
          <option value="Van">Van</option>
          <option value="Pickup">Pickup</option>
        </select>

        <select
          value={area}
          onChange={(e) => setParam("area", e.target.value)}
          disabled={!city}
        >
          <option value="">{city ? "All Areas" : "Select a city first"}</option>
          {getAreas(city).map((a) => (
            <option key={a} value={a.toLowerCase()}>
              {a}
            </option>
          ))}
        </select>

        <label className="sold-toggle">
          <input
            type="checkbox"
            checked={showSold}
            onChange={(e) => setParam("sold", e.target.checked ? "1" : "")}
          />{" "}
          Show sold cars
        </label>
      </div>

      <div className="results-bar">
        <span>
          {loading ? "Loading..." : `${total} ${total === 1 ? "car" : "cars"} found`}
        </span>

        <label>
          Sort by:{" "}
          <select
            value={sortBy}
            onChange={(e) =>
              setParam("sort", e.target.value === "newest" ? "" : e.target.value)
            }
          >
            <option value="newest">Newest listed</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="year-new">Year: Newest first</option>
            <option value="mileage-low">Mileage: Lowest first</option>
          </select>
        </label>
      </div>

      {error ? (
        <h2 className="cars-message">{error}</h2>
      ) : !loading && total === 0 ? (
        hasFilters ? (
          <div className="empty-cars">
            <h2>No matching cars found</h2>
            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="empty-cars">
            <h2>No cars available</h2>
            <p>Be the first person to sell a car!</p>
            <Link to="/sell" className="sell-link">
              Sell Your Car
            </Link>
          </div>
        )
      ) : (
        <>
          <div className="cars-grid" style={{ opacity: loading ? 0.5 : 1 }}>
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <span>
                Page {currentPage} of {pages}
              </span>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === pages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ViewCars;