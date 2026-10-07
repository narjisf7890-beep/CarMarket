import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={close}>
        <svg
          className="logo-img"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8 38l6-16c1-3 4-5 7-5h22c3 0 6 2 7 5l6 16v10a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-2H18v2a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3V38z"
            fill="#1769ff"
          />
          <path d="M17 24h30l4 11H13l4-11z" fill="#dbe8ff" />
          <circle cx="19" cy="40" r="3.5" fill="#fff" />
          <circle cx="45" cy="40" r="3.5" fill="#fff" />
        </svg>
        <span>CarMarket</span>
      </Link>

      <button
        className="nav-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? "✕" : "☰"}
      </button>

      <div className={`nav-links ${open ? "open" : ""}`} onClick={close}>
        <Link to="/">Home</Link>
        <Link to="/cars?condition=used">Used Cars</Link>
        <Link to="/cars?condition=new">New Cars</Link>
        <Link to="/sell">Sell Your Car</Link>
        <Link to="/compare">Compare</Link>

        {user ? (
          <>
            <Link to="/my-listings">My Listings</Link>
            <Link to="/saved">Saved</Link>
            {user?.is_admin && <Link to="/admin">Admin</Link>}

            <span className="nav-user">
              <span className="nav-avatar">
                {user.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="nav-name">{user.name}</span>
            </span>

            <button className="nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;