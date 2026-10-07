import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { API_URL } from "../config";
import { useAuth } from "../AuthContext";
import PasswordInput from "../PasswordInput";

const cityList = ["Islamabad", "Rawalpindi", "Lahore", "Karachi", "Peshawar", "Quetta", "Multan", "Faisalabad"];

// 12345-1234567-1 format mein dikhata hai
const formatCnic = (value) => {
  const d = value.replace(/\D/g, "").slice(0, 13);
  if (d.length <= 5) return d;
  if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
};

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", cnic: "",
    city: "", address: "", password: "", confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "cnic" ? formatCnic(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.cnic.replace(/\D/g, "").length !== 13) {
      setMessage("CNIC must be 13 digits (e.g. 12345-1234567-1)");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

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
      <h1>Create Account</h1>
      <p>Create an account to sell your car.</p>

      <form className="car-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Full Name</label>
        <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />

        <label htmlFor="phone">Phone Number (WhatsApp)</label>
        <input id="phone" type="tel" name="phone" placeholder="03001234567" value={formData.phone} onChange={handleChange} required />

        <label htmlFor="cnic">CNIC</label>
        <input id="cnic" type="text" name="cnic" inputMode="numeric" placeholder="12345-1234567-1" value={formData.cnic} onChange={handleChange} required />

        <label htmlFor="city">City</label>
        <select id="city" name="city" value={formData.city} onChange={handleChange} required>
          <option value="">Select City</option>
          {cityList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label htmlFor="address">Address</label>
        <textarea id="address" name="address" placeholder="House, street, area" maxLength={255} value={formData.address} onChange={handleChange} required />

        <label htmlFor="password">Password (at least 8 characters)</label>
        <PasswordInput id="password" name="password" minLength={8} value={formData.password} onChange={handleChange} />

        <label htmlFor="confirmPassword">Re-enter Password</label>
        <PasswordInput id="confirmPassword" name="confirmPassword" minLength={8} value={formData.confirmPassword} onChange={handleChange} />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>

        {message && (
          <p className="form-message" style={{ color: "#b91c1c" }}>{message}</p>
        )}

        <div className="auth-divider"><span>or</span></div>

        <button type="button" className="guest-btn" onClick={() => navigate("/cars")}>
          Continue as Guest
        </button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;