export const MIN_PRICE = 500000; // 5 lac, sab cars ke liye

// Brand ki minimum price (PKR)
export const BRAND_MIN = {
  Suzuki: 500000, Daewoo: 500000, Toyota: 600000, Daihatsu: 600000,
  Chevrolet: 600000, FAW: 600000, Honda: 800000, Nissan: 800000,
  Mitsubishi: 800000, Mazda: 1000000, United: 1000000, Kia: 1500000,
  Hyundai: 1500000, Subaru: 1500000, Volkswagen: 1500000, Ford: 1500000,
  Honri: 1500000, Changan: 1800000, Isuzu: 2000000, Proton: 2000000,
  DFSK: 2000000, JAC: 2000000, Prince: 2000000, MG: 3000000,
  Audi: 3000000, BMW: 3000000, "Mercedes-Benz": 3000000, Volvo: 3000000,
  Peugeot: 3000000, BAIC: 3000000, Hino: 3000000, Lexus: 4000000,
  Jeep: 4000000, Haval: 4000000, Chery: 4000000, "Land Rover": 5000000,
  Jetour: 5000000, GAC: 5000000, BYD: 6000000, Porsche: 8000000,
  "Range Rover": 8000000, Tesla: 8000000,
};

// Model ki minimum price (brand ki price se zyada ho to ye use hoti hai)
export const MODEL_MIN = {
  "Toyota|Corolla": 1200000, "Toyota|Yaris": 2500000, "Toyota|Camry": 2000000,
  "Toyota|Fortuner": 6000000, "Toyota|Hilux": 3000000, "Toyota|Revo": 5000000,
  "Toyota|Land Cruiser": 12000000, "Toyota|Prado": 8000000,
  "Toyota|Vitz": 800000, "Toyota|Prius": 1500000, "Toyota|Aqua": 1800000,
  "Toyota|Passo": 900000, "Toyota|Hiace": 3000000, "Toyota|Rush": 2000000,
  "Honda|Civic": 1200000, "Honda|City": 1000000, "Honda|BR-V": 3500000,
  "Honda|HR-V": 5000000, "Honda|Vezel": 3500000, "Honda|Accord": 2500000,
  "Honda|N-Wgn": 1500000, "Honda|Fit": 1200000,
  "Suzuki|Alto": 600000, "Suzuki|Wagon R": 900000, "Suzuki|Cultus": 700000,
  "Suzuki|Swift": 1200000, "Suzuki|Jimny": 5000000, "Suzuki|Every": 1200000,
  "Suzuki|Liana": 600000,
  "Kia|Sportage": 3500000, "Kia|Sorento": 8000000, "Kia|Stonic": 4000000,
  "Kia|Carnival": 8000000, "Kia|Sonet": 3500000, "Kia|Picanto": 1800000,
  "Hyundai|Tucson": 4000000, "Hyundai|Santa Fe": 7000000,
  "Hyundai|Elantra": 3000000, "Hyundai|Sonata": 4000000,
  "Nissan|X-Trail": 3000000, "Nissan|Juke": 2500000, "Nissan|Note": 1500000,
  "Nissan|Dayz": 1200000, "Nissan|Clipper": 800000,
  "Daihatsu|Mira": 600000, "Daihatsu|Cuore": 600000, "Daihatsu|Move": 900000,
  "Daihatsu|Tanto": 1200000, "Daihatsu|Terios": 1800000,
  "Changan|Alsvin": 3000000, "Changan|Oshan X7": 6000000,
  "Changan|Karvaan": 1800000,
  "MG|HS": 6000000, "MG|ZS": 5000000, "MG|4 EV": 8000000,
  "Mitsubishi|Pajero": 3500000, "Mitsubishi|Outlander": 3500000,
  "Haval|H6": 7000000, "Haval|Jolion": 5500000,
  "BYD|Atto 3": 9000000, "BYD|Seal": 12000000, "BYD|Dolphin": 6000000,
  "Land Rover|Defender": 20000000, "Range Rover|Vogue": 25000000,
  "Tesla|Model S": 15000000, "Tesla|Model X": 18000000,
  "Porsche|911": 25000000, "Porsche|Cayenne": 15000000,
};

export function getMinPrice(brand, model) {
  const b = (brand || "").trim();
  const m = (model || "").trim();
  return Math.max(
    MIN_PRICE,
    BRAND_MIN[b] || 0,
    MODEL_MIN[`${b}|${m}`] || 0
  );
}

export const formatPKR = (n) => `PKR ${Number(n).toLocaleString()}`;