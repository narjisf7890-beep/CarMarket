import { useState } from "react";
import { Link } from "react-router";
import { API_URL } from "./config";
import { useAuth } from "./AuthContext";
import { getMinPrice, formatPKR } from "./carPrices";
import VideoPicker from "./VideoPicker";
import { cityNames, getAreas } from "./locations";

const MAX_IMAGES = 20;
const MAX_SIZE = 5 * 1024 * 1024;

const carModels = {
  Toyota: ["Corolla", "Yaris", "Camry", "Fortuner", "Hilux", "Land Cruiser", "Vitz", "Prius", "Aqua", "Passo", "Revo", "Prado", "Hiace", "Rush"],
  Honda: ["Civic", "City", "BR-V", "HR-V", "Vezel", "Accord", "N-Wgn", "Fit"],
  Suzuki: ["Alto", "Wagon R", "Cultus", "Swift", "Bolan", "Ravi", "Mehran", "Jimny", "Every", "Liana"],
  Kia: ["Picanto", "Sportage", "Sorento", "Stonic", "Carnival", "Sonet", "Rio"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Porter", "Staria"],
  Changan: ["Alsvin", "Oshan X7", "Karvaan", "Kaicene"],
  MG: ["ZS", "HS", "GT", "5", "4 EV"],
  Nissan: ["Dayz", "Juke", "Note", "X-Trail", "Sunny", "Clipper"],
  Daihatsu: ["Mira", "Cuore", "Move", "Tanto", "Hijet", "Terios"],
  Mitsubishi: ["Lancer", "Pajero", "Eclipse Cross", "Outlander", "Minica"],
  Mazda: ["Mazda 3", "Mazda 6", "CX-5", "Demio", "Axela"],
  Subaru: ["Forester", "Impreza", "XV", "Legacy"],
  Isuzu: ["D-Max", "MU-X", "Elf"],
  Lexus: ["RX", "NX", "LX", "IS", "ES"],
  Audi: ["A3", "A4", "A6", "Q3", "Q5", "Q7", "e-tron GT"],
  BMW: ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "i8"],
  "Mercedes-Benz": ["C Class", "E Class", "S Class", "GLC", "GLE", "A Class"],
  Volkswagen: ["Golf", "Polo", "Tiguan", "Passat"],
  Volvo: ["XC60", "XC90", "S90"],
  Porsche: ["Cayenne", "Macan", "911", "Panamera"],
  "Land Rover": ["Defender", "Discovery", "Freelander"],
  "Range Rover": ["Sport", "Evoque", "Velar", "Vogue"],
  Jeep: ["Wrangler", "Grand Cherokee", "Compass"],
  Ford: ["Ranger", "Mustang", "Fiesta", "Focus"],
  Chevrolet: ["Aveo", "Cruze", "Optra", "Spark"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y"],
  Peugeot: ["208", "2008", "3008", "5008"],
  Proton: ["Saga", "X70", "X50"],
  DFSK: ["Glory 580", "Glory 500", "Prince"],
  FAW: ["V2", "V80", "X-PV", "Carrier"],
  Haval: ["H6", "Jolion", "H6 HEV"],
  BAIC: ["BJ40", "X7", "D20"],
  JAC: ["T6", "S2", "X200"],
  Prince: ["Pearl", "K01"],
  United: ["Bravo", "Alpha"],
  Daewoo: ["Racer", "Cielo"],
  BYD: ["Atto 3", "Seal", "Dolphin", "Sealion 6"],
  Chery: ["Tiggo 4 Pro", "Tiggo 8 Pro", "Arrizo 6"],
  Jetour: ["X70", "Dashing"],
  GAC: ["GS3", "GS8", "Emkoo"],
  Hino: ["300 Series", "500 Series"],
  Honri: ["Vita"],
};

const emptyForm = {
  condition: "used",
  brand: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  city: "",
  area: "",
  fuel_type: "",
  transmission: "",
  body_type: "",
  paint: "",
  description: "",
};

function AddCar() {
  const { token } = useAuth();

  const [formData, setFormData] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const isNew = formData.condition === "new";
  const availableModels = formData.brand ? carModels[formData.brand] || [] : [];
  const minPrice = getMinPrice(formData.brand, formData.model);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrandChange = (e) =>
    setFormData((prev) => ({ ...prev, brand: e.target.value, model: "" }));

  // Changing the city clears the selected area
  const handleCityChange = (e) =>
    setFormData((prev) => ({ ...prev, city: e.target.value, area: "" }));

  // New images are added to the existing ones (not replaced)
  const handleImagesChange = (e) => {
    const picked = Array.from(e.target.files);
    e.target.value = "";

    const small = picked.filter((f) => f.size <= MAX_SIZE);
    const room = MAX_IMAGES - imageFiles.length;
    const added = small.slice(0, room);

    if (small.length < picked.length) {
      setIsError(true);
      setMessage("Images larger than 5MB were skipped.");
    } else if (small.length > room) {
      setIsError(true);
      setMessage(`A maximum of ${MAX_IMAGES} images is allowed.`);
    } else {
      setMessage("");
    }

    setImageFiles((prev) => [...prev, ...added]);
    setPreviews((prev) => [...prev, ...added.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setMessage("");

    if (Number(formData.price) < minPrice) {
      setIsError(true);
      setMessage(`Minimum price for this car is ${formatPKR(minPrice)}.`);
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "mileage") {
          data.append(key, isNew ? "0" : value);
        } else {
          data.append(key, key === "brand" ? value.trim() : value);
        }
      });
      imageFiles.forEach((file) => data.append("images", file));
      if (video) data.append("video", video);

      const response = await fetch(`${API_URL}/api/cars`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.msg || "Failed to add car");

      setIsError(false);
      setMessage("Car added successfully!");
      setFormData(emptyForm);
      setImageFiles([]);
      setPreviews([]);
      setVideo(null);
      form.reset();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="add-car-page">
        <h1>Sell Your Car</h1>
        <p>Please login to sell your car.</p>
        <p>
          <Link to="/login">Login</Link> | <Link to="/signup">Sign up</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="add-car-page">
      <h1>Sell Your Car</h1>
      <p>Enter your car information to create a listing.</p>

      <form className="car-form" onSubmit={handleSubmit}>
        <label htmlFor="condition">Car Condition</label>
        <select id="condition" name="condition" value={formData.condition} onChange={handleChange}>
          <option value="used">Used Car</option>
          <option value="new">New Car</option>
        </select>

        <label htmlFor="brand">Brand</label>
        <select id="brand" name="brand" value={formData.brand} onChange={handleBrandChange} required>
          <option value="">Select Brand</option>
          {Object.keys(carModels).map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <label htmlFor="model">Model</label>
        <select id="model" name="model" value={formData.model} onChange={handleChange} disabled={!formData.brand} required>
          <option value="">{formData.brand ? "Select Model" : "Select Brand First"}</option>
          {availableModels.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <label htmlFor="year">Year</label>
        <input id="year" type="number" name="year" placeholder="e.g. 2022" min="1980" max="2027" value={formData.year} onChange={handleChange} required />

        <label htmlFor="price">Price (PKR)</label>
        <input
          id="price"
          type="number"
          name="price"
          placeholder={`Minimum ${minPrice.toLocaleString()}`}
          min={minPrice}
          value={formData.price}
          onChange={handleChange}
          required
        />
        <small>
          Minimum price{formData.model ? ` for ${formData.brand} ${formData.model}` : ""}:{" "}
          {formatPKR(minPrice)}
        </small>

        {!isNew && (
          <>
            <label htmlFor="mileage">Mileage (KM)</label>
            <input id="mileage" type="number" name="mileage" placeholder="e.g. 45000" min="0" value={formData.mileage} onChange={handleChange} required />
          </>
        )}

        <label htmlFor="city">City</label>
        <select id="city" name="city" value={formData.city} onChange={handleCityChange} required>
          <option value="">Select City</option>
          {cityNames.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label htmlFor="area">Area / Sector</label>
        <select
          id="area"
          name="area"
          value={formData.area}
          onChange={handleChange}
          disabled={!formData.city}
          required
        >
          <option value="">{formData.city ? "Select Area" : "Select City First"}</option>
          {getAreas(formData.city).map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <label htmlFor="fuel_type">Fuel Type</label>
        <select id="fuel_type" name="fuel_type" value={formData.fuel_type} onChange={handleChange} required>
          <option value="">Select Fuel Type</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Hybrid">Hybrid</option>
          <option value="CNG">CNG</option>
          <option value="Electric">Electric</option>
        </select>

        <label htmlFor="transmission">Transmission</label>
        <select id="transmission" name="transmission" value={formData.transmission} onChange={handleChange} required>
          <option value="">Select Transmission</option>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
        </select>

        <label htmlFor="body_type">Body Type</label>
        <select id="body_type" name="body_type" value={formData.body_type} onChange={handleChange} required>
          <option value="">Select Body Type</option>
          <option value="Sedan">Sedan</option>
          <option value="Hatchback">Hatchback</option>
          <option value="SUV">SUV</option>
          <option value="Crossover">Crossover</option>
          <option value="Van">Van</option>
          <option value="Pickup">Pickup</option>
        </select>

        <label htmlFor="paint">Paint Condition</label>
        <select id="paint" name="paint" value={formData.paint} onChange={handleChange}>
          <option value="">Not specified</option>
          <option value="Original">Original paint</option>
          <option value="Partially repainted">Partially repainted</option>
          <option value="Fully repainted">Fully repainted</option>
        </select>

        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" placeholder="Describe your car..." maxLength={2000} value={formData.description} onChange={handleChange} />

        <label htmlFor="images">
          Car Images ({imageFiles.length}/{MAX_IMAGES}, max 5MB each) - the first image will be the cover
        </label>
        <input
          id="images"
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleImagesChange}
          disabled={imageFiles.length >= MAX_IMAGES}
        />

        {previews.length > 0 && (
          <div className="thumb-grid">
            {previews.map((src, i) => (
              <div className="thumb-item" key={src}>
                <img src={src} alt={`Preview ${i + 1}`} />
                {i === 0 && <span className="cover-tag">Cover</span>}
                <button type="button" onClick={() => removeImage(i)}>×</button>
              </div>
            ))}
          </div>
        )}

        <label>Car Video (optional)</label>
        <VideoPicker
          file={video}
          onFile={setVideo}
          onError={(msg) => {
            setIsError(Boolean(msg));
            setMessage(msg);
          }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Adding Car..." : "Add Car"}
        </button>

        {message && (
          <p className="form-message" style={{ color: isError ? "#b91c1c" : "#15803d" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default AddCar;