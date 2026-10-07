import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { API_URL } from "../config";

function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) setTimeout(() => navigate("/login"), 1500);
    } catch {
      setMessage("Network error, please try again");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="add-car-page">
        <h1>Reset Password</h1>
        <p>This reset link is invalid.</p>
        <Link to="/forgot-password">Request a new link</Link>
      </div>
    );
  }

  return (
    <div className="add-car-page">
      <h1>Set a new password</h1>

      <form className="car-form" onSubmit={handleSubmit}>
        <label htmlFor="password">New password (min 8 characters)</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="confirm">Confirm password</label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Reset Password"}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
}

export default ResetPassword;