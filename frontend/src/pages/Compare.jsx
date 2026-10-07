import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL, getImageUrl } from "../config";

const MAX_COMPARE = 3;

const rows = [
  ["Price", (c) => `PKR ${Number(c.price).toLocaleString()}`],
  ["Year", (c) => c.year],
  ["Condition", (c) => (c.condition === "new" ? "New" : "Used")],
  [
    "Mileage",
    (c) =>
      c.condition === "new" ? "Brand New" : `${Number(c.mileage).toLocaleString()} km`,
  ],
  ["City", (c) => c.city],
  ["Fuel", (c) => c.fuel_type || "-"],
  ["Transmission", (c) => c.transmission || "-"],
  ["Body Type", (c) => c.body_type || "-"],
  ["Seller", (c) => c.seller_name || "-"],
];

function Compare() {
  const [allCars, setAllCars] = useState([]);
  const [selected, setSelected] = useState(["", ""]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/cars`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load cars");
        return r.json();
      })
      .then((data) => {
        setAllCars(data.filter((c) => c.status !== "sold"));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const setSlot = (index, value) =>
    setSelected((prev) => prev.map((v, i) => (i === index ? value : v)));

  const addSlot = () => setSelected((prev) => [...prev, ""]);
  const removeSlot = (index) =>
    setSelected((prev) => prev.filter((_, i) => i !== index));

  const chosen = selected
    .map((id) => allCars.find((c) => String(c.id) === id))
    .filter(Boolean);

  if (loading) return <h2 className="cars-message">Loading cars...</h2>;
  if (error) return <h2 className="cars-message">{error}</h2>;

  return (
    <div className="cars-page">
      <h1>Compare Cars</h1>
      <p className="cars-subtitle">Select up to {MAX_COMPARE} cars to compare side by side.</p>

      <div className="compare-pickers">
        {selected.map((value, i) => (
          <div className="compare-picker" key={i}>
            <select value={value} onChange={(e) => setSlot(i, e.target.value)}>
              <option value="">Select car {i + 1}</option>
              {allCars.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  disabled={selected.includes(String(c.id)) && String(c.id) !== value}
                >
                  {c.brand.trim()} {c.model} ({c.year}) - PKR{" "}
                  {Number(c.price).toLocaleString()}
                </option>
              ))}
            </select>
            {selected.length > 2 && (
              <button type="button" onClick={() => removeSlot(i)}>×</button>
            )}
          </div>
        ))}

        {selected.length < MAX_COMPARE && (
          <button type="button" className="clear-filter-button" onClick={addSlot}>
            + Add another car
          </button>
        )}
      </div>

      {chosen.length < 2 ? (
        <div className="empty-cars">
          <h2>Select at least 2 cars</h2>
          <p>Your comparison table will appear here.</p>
        </div>
      ) : (
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th></th>
                {chosen.map((c) => (
                  <th key={c.id}>
                    {c.image && (
                      <img src={getImageUrl(c.image)} alt={`${c.brand} ${c.model}`} />
                    )}
                    <div>{c.brand.trim()} {c.model}</div>
                    <Link to={`/cars/${c.id}`}>View details</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, getValue]) => (
                <tr key={label}>
                  <td>{label}</td>
                  {chosen.map((c) => (
                    <td key={c.id} style={{ textTransform: label === "City" ? "capitalize" : "none" }}>
                      {getValue(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Compare;