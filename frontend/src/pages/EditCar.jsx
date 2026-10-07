import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { API_URL, getImageUrl } from "../config";
import { useAuth } from "../AuthContext";
import { getMinPrice, formatPKR } from "../carPrices";
import { cityNames, getAreas } from "../locations";
import VideoPicker from "../VideoPicker";

const MAX_IMAGES = 20;
const MAX_SIZE = 5 * 1024 * 1024;

function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
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
  });

  const [existingImages, setExistingImages] = useState([]);
  const [deleteIds, setDeleteIds] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [existingVideo, setExistingVideo] = useState("");
  const [removeVideo, setRemoveVideo] = useState(false);
  const [newVideo, setNewVideo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isNew = formData.condition === "new";
  const keptCount = existingImages.length - deleteIds.length;
  const minPrice = getMinPrice(formData.brand, formData.model);

  useEffect(() => {
    fetch(`${API_URL}/api/cars/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Car not found");
        }
        return response.json();
      })
      .then((data) => {
        const matchedCity =
          cityNames.find(
            (c) => c.toLowerCase() === (data.city || "").trim().toLowerCase()
          ) || "";

        setFormData({
          condition: data.condition || "used",
          brand: (data.brand || "").trim(),
          model: data.model,
          year: data.year,
          price: data.price,
          mileage: data.mileage,
          city: matchedCity,
          area: data.area || "",
          fuel_type: data.fuel_type || "",
          transmission: data.transmission || "",
          body_type: data.body_type || "",
          paint: data.paint || "",
          description: data.description || "",
        });

        setExistingImages(data.images || []);
        setExistingVideo(data.video || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Changing the city clears the selected area
  const handleCityChange = (e) =>
    setFormData({ ...formData, city: e.target.value, area: "" });

  const handleImageChange = (e) => {
    const picked = Array.from(e.target.files);
    e.target.value = "";

    const small = picked.filter((f) => f.size <= MAX_SIZE);
    const room = MAX_IMAGES - keptCount - newImages.length;
    const added = small.slice(0, room);

    if (added.length < picked.length) {
      setError("Some images were skipped (larger than 5MB or limit reached).");
    } else {
      setError("");
    }

    setNewImages((prev) => [...prev, ...added]);
    setPreviews((prev) => [...prev, ...added.map((f) => URL.createObjectURL(f))]);
  };

  const removeNew = (index) => {
    URL.revokeObjectURL(previews[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleDelete = (imgId) => {
    setDeleteIds((prev) =>
      prev.includes(imgId) ? prev.filter((x) => x !== imgId) : [...prev, imgId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(formData.price) < minPrice) {
      setError(`Minimum price for this car is ${formatPKR(minPrice)}.`);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const data = new FormData();

      data.append("condition", formData.condition);
      data.append("brand", formData.brand.trim());
      data.append("model", formData.model);
      data.append("year", formData.year);
      data.append("price", formData.price);
      data.append("mileage", isNew ? "0" : formData.mileage);
      data.append("city", formData.city);
      data.append("area", formData.area);
      data.append("fuel_type", formData.fuel_type);
      data.append("transmission", formData.transmission);
      data.append("body_type", formData.body_type);
      data.append("paint", formData.paint);
      data.append("description", formData.description);

      deleteIds.forEach((imgId) => data.append("delete_image_ids", imgId));
      newImages.forEach((file) => data.append("images", file));

      if (newVideo) data.append("video", newVideo);
      else if (removeVideo) data.append("delete_video", "1");

      const response = await fetch(`${API_URL}/api/cars/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.msg || "Failed to update car");
      }

      alert("Car updated successfully!");
      navigate(`/cars/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <h2 className="details-message">Loading car information...</h2>;
  }

  if (error && !formData.brand) {
    return (
      <div className="details-message">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="add-car-page">
      <h1>Edit Car</h1>
      <p>Update your car listing information.</p>

      {error && <p className="form-message">{error}</p>}

      <form className="car-form" onSubmit={handleSubmit}>
        <label>Car Condition</label>
        <select name="condition" value={formData.condition} onChange={handleChange}>
          <option value="used">Used Car</option>
          <option value="new">New Car</option>
        </select>

        <label>Brand</label>
        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          required
        />

        <label>Model</label>
        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          required
        />

        <label>Year</label>
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          required
        />

        <label>Price (PKR)</label>
        <input
          type="number"
          name="price"
          min={minPrice}
          value={formData.price}
          onChange={handleChange}
          required
        />
        <small>Minimum price: {formatPKR(minPrice)}</small>

        {!isNew && (
          <>
            <label>Mileage (KM)</label>
            <input
              type="number"
              name="mileage"
              min="0"
              value={formData.mileage}
              onChange={handleChange}
              required
            />
          </>
        )}

        <label>City</label>
        <select
          name="city"
          value={formData.city}
          onChange={handleCityChange}
          required
        >
          <option value="">Select City</option>
          {cityNames.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label>Area / Sector</label>
        <select
          name="area"
          value={formData.area}
          onChange={handleChange}
          disabled={!formData.city}
        >
          <option value="">{formData.city ? "Select Area" : "Select City First"}</option>
          {getAreas(formData.city).map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <label>Fuel Type</label>
        <select
          name="fuel_type"
          value={formData.fuel_type}
          onChange={handleChange}
          required
        >
          <option value="">Select Fuel Type</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Hybrid">Hybrid</option>
          <option value="CNG">CNG</option>
          <option value="Electric">Electric</option>
        </select>

        <label>Transmission</label>
        <select
          name="transmission"
          value={formData.transmission}
          onChange={handleChange}
          required
        >
          <option value="">Select Transmission</option>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
        </select>

        <label>Body Type</label>
        <select
          name="body_type"
          value={formData.body_type}
          onChange={handleChange}
          required
        >
          <option value="">Select Body Type</option>
          <option value="Sedan">Sedan</option>
          <option value="Hatchback">Hatchback</option>
          <option value="SUV">SUV</option>
          <option value="Crossover">Crossover</option>
          <option value="Van">Van</option>
          <option value="Pickup">Pickup</option>
        </select>

        <label>Paint Condition</label>
        <select name="paint" value={formData.paint} onChange={handleChange}>
          <option value="">Not specified</option>
          <option value="Original">Original paint</option>
          <option value="Partially repainted">Partially repainted</option>
          <option value="Fully repainted">Fully repainted</option>
        </select>

        <label>Description</label>
        <textarea
          name="description"
          maxLength={2000}
          value={formData.description}
          onChange={handleChange}
        />

        <label>
          Car Images ({keptCount + newImages.length}/{MAX_IMAGES})
        </label>

        <div className="thumb-grid">
          {existingImages.map((img) => (
            <div
              className={`thumb-item ${deleteIds.includes(img.id) ? "marked" : ""}`}
              key={img.id}
            >
              <img src={getImageUrl(img.url)} alt="Car" />
              <button type="button" onClick={() => toggleDelete(img.id)}>
                {deleteIds.includes(img.id) ? "↺" : "×"}
              </button>
            </div>
          ))}

          {previews.map((src, i) => (
            <div className="thumb-item" key={src}>
              <img src={src} alt="New" />
              <span className="cover-tag">New</span>
              <button type="button" onClick={() => removeNew(i)}>×</button>
            </div>
          ))}
        </div>

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleImageChange}
          disabled={keptCount + newImages.length >= MAX_IMAGES}
        />
        <small>
          Click × to remove an image (applied after saving). The first image is the cover.
        </small>

        <label>Car Video (optional)</label>
        <VideoPicker
          file={newVideo}
          onFile={setNewVideo}
          onError={setError}
          existingUrl={existingVideo ? getImageUrl(existingVideo) : ""}
          removeExisting={removeVideo}
          onToggleRemove={() => setRemoveVideo((v) => !v)}
        />

        <button type="submit" disabled={saving}>
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default EditCar;