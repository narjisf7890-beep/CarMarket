import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../config";
import { useAuth } from "../AuthContext";

const REASONS = {
  fake: "Fake listing",
  wrong_info: "Incorrect information",
  scam: "Suspected fraud / scam",
  sold: "Already sold",
  other: "Other",
};

function AdminDashboard() {
  const { token, user } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [tab, setTab] = useState("reports");
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [cars, setCars] = useState([]);
  const [error, setError] = useState("");

  const loadStats = () =>
    fetch(`${API_URL}/api/admin/stats`, { headers })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});

  const loadReports = () =>
    fetch(`${API_URL}/api/admin/reports?status=open`, { headers })
      .then((r) => {
        if (!r.ok) throw new Error("You do not have admin access");
        return r.json();
      })
      .then(setReports)
      .catch((e) => setError(e.message));

  const loadCars = () =>
    fetch(`${API_URL}/api/cars`)
      .then((r) => r.json())
      .then(setCars)
      .catch(() => {});

  useEffect(() => {
    if (!user?.is_admin) return;
    loadStats();
    loadReports();
    loadCars();
  }, [user?.is_admin]);

  const resolve = async (id) => {
    await fetch(`${API_URL}/api/admin/reports/${id}`, {
      method: "PATCH",
      headers,
    });
    loadReports();
    loadStats();
  };

  const deleteCar = async (carId) => {
    if (!window.confirm("This car will be deleted permanently. Are you sure?")) {
      return;
    }
    const res = await fetch(`${API_URL}/api/admin/cars/${carId}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) {
      loadReports();
      loadCars();
      loadStats();
    }
  };

  if (!token || !user?.is_admin) {
    return (
      <div className="cars-page">
        <h1>Admin Dashboard</h1>
        <p>This page is for admins only.</p>
        <Link to="/">← Home</Link>
      </div>
    );
  }

  return (
    <div className="cars-page">
      <h1>Admin Dashboard</h1>

      {stats && (
        <div className="admin-stats">
          <div><strong>{stats.users}</strong><span>Users</span></div>
          <div><strong>{stats.cars}</strong><span>Cars</span></div>
          <div><strong>{stats.sold}</strong><span>Sold</span></div>
          <div><strong>{stats.open_reports}</strong><span>Open reports</span></div>
        </div>
      )}

      <div className="condition-tabs">
        <button
          className={tab === "reports" ? "active" : ""}
          onClick={() => setTab("reports")}
        >
          Reports
        </button>
        <button
          className={tab === "cars" ? "active" : ""}
          onClick={() => setTab("cars")}
        >
          All Cars
        </button>
      </div>

      {error && <p className="form-message">{error}</p>}

      {tab === "reports" &&
        (reports.length === 0 ? (
          <div className="empty-cars">
            <h2>No open reports 🎉</h2>
          </div>
        ) : (
          <div className="admin-list">
            {reports.map((r) => (
              <div className="admin-row" key={r.id}>
                <div>
                  <strong>{r.car ? r.car.title : "Car already deleted"}</strong>
                  <p>
                    {REASONS[r.reason] || r.reason}
                    {r.report_count > 1 &&
                      ` • ${r.report_count} reports on this car`}
                  </p>
                  {r.details && <p>"{r.details}"</p>}
                  <small>
                    Reported by {r.reporter_name} on {r.created_at}
                    {r.car?.seller_name && ` • Seller: ${r.car.seller_name}`}
                  </small>
                </div>
                <div className="admin-actions">
                  {r.car && (
                    <Link to={`/cars/${r.car.id}`} target="_blank">
                      View
                    </Link>
                  )}
                  <button onClick={() => resolve(r.id)}>Resolve</button>
                  {r.car && (
                    <button
                      className="delete-button"
                      onClick={() => deleteCar(r.car.id)}
                    >
                      Delete car
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

      {tab === "cars" && (
        <div className="admin-list">
          {cars.map((c) => (
            <div className="admin-row" key={c.id}>
              <div>
                <strong>
                  {c.brand.trim()} {c.model} ({c.year})
                </strong>
                <p>
                  PKR {Number(c.price).toLocaleString()} • {c.city} •{" "}
                  {c.condition === "new" ? "New" : "Used"}
                  {c.status === "sold" && " • SOLD"}
                </p>
                <small>
                  Seller: {c.seller_name} • 👁 {c.views || 0}
                </small>
              </div>
              <div className="admin-actions">
                <Link to={`/cars/${c.id}`} target="_blank">
                  View
                </Link>
                <button className="delete-button" onClick={() => deleteCar(c.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;