import { useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../config";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setMessage(data.message || "Something went wrong");
    } catch {
      setMessage("Network error, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-car-page">
      <h1>Forgot Password</h1>
      <p>Enter your email and we will send you a reset link.</p>

      <form className="car-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && <p className="form-message">{message}</p>}

        <p>
          <Link to="/login">← Back to Login</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;