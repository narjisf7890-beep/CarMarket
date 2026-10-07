export const API_URL = "http://127.0.0.1:5000";

export const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/400x250?text=No+Image";
  if (image.startsWith("http")) return image;
  return `${API_URL}${image}`;
};

// Converts a Pakistani number to WhatsApp format (92XXXXXXXXXX)
export const getWhatsAppLink = (phone, message = "") => {
  if (!phone) return "";

  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0092")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "92" + digits.slice(1);

  return `https://wa.me/${digits}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
};