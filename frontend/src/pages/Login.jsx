import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { API_URL } from "../config";
import { useAuth } from "../AuthContext";
import PasswordInput from "../PasswordInput";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      login(data.token, data.user);
      navigate("/cars");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-car-page">
      <h1>Login</h1>
      <p>Welcome back! Login with your email or phone number.</p>

      <form className="car-form" onSubmit={handleSubmit}>
        <label htmlFor="identifier">Email or Phone Number</label>
        <input
          id="identifier"
          type="text"
          name="identifier"
          placeholder="you@example.com or 03001234567"
          value={formData.identifier}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <PasswordInput
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        <p className="auth-link-right">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && (
          <p className="form-message" style={{ color: "#b91c1c" }}>
            {message}
          </p>
        )}

        <div className="auth-divider"><span>or</span></div>

        <button
          type="button"
          className="guest-btn"
          onClick={() => navigate("/cars")}
        >
          Continue as Guest
        </button>

        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;