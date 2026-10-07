export const cityAreas = {
  Islamabad: [
    "D-12", "E-7", "E-8", "E-9", "E-10", "E-11",
    "F-6", "F-7", "F-8", "F-9", "F-10", "F-11",
    "G-5", "G-6", "G-7", "G-8", "G-9", "G-10", "G-11", "G-13", "G-14", "G-15", "G-16",
    "H-8", "H-9", "H-10", "H-11", "H-13",
    "I-8", "I-9", "I-10", "I-11", "I-14", "I-15", "I-16",
    "B-17", "C-17", "D-17",
    "Bahria Town", "Bani Gala", "Chak Shahzad", "DHA Phase 1", "DHA Phase 2",
    "Gulberg Greens", "Park Road", "PWD", "Saddar", "Tarnol", "Other",
  ],
  Rawalpindi: [
    "Saddar", "Chaklala Scheme 3", "Satellite Town", "Commercial Market",
    "Bahria Town", "DHA", "Gulzar-e-Quaid", "Adiala Road", "Westridge",
    "Peshawar Road", "Murree Road", "Raja Bazar", "Other",
  ],
  Lahore: [
    "DHA", "Gulberg", "Johar Town", "Model Town", "Bahria Town", "Cantt",
    "Allama Iqbal Town", "Wapda Town", "Faisal Town", "Samanabad",
    "Garden Town", "Township", "Valencia", "Shadman", "Other",
  ],
  Karachi: [
    "DHA", "Clifton", "Gulshan-e-Iqbal", "Gulistan-e-Jauhar", "North Nazimabad",
    "Nazimabad", "PECHS", "Bahadurabad", "Korangi", "Malir", "Saddar",
    "Scheme 33", "Bahria Town", "Federal B Area", "Other",
  ],
  Peshawar: [
    "University Town", "Hayatabad", "Saddar", "Gulbahar", "Ring Road",
    "Warsak Road", "Cantt", "Other",
  ],
  Quetta: [
    "Jinnah Town", "Satellite Town", "Cantt", "Sariab Road",
    "Airport Road", "Other",
  ],
  Multan: [
    "Cantt", "Gulgasht", "Shah Rukn-e-Alam Colony", "Bosan Road",
    "Model Town", "DHA", "Other",
  ],
  Faisalabad: [
    "D Ground", "Peoples Colony", "Madina Town", "Civil Lines",
    "Jaranwala Road", "Susan Road", "Other",
  ],
};

export const cityNames = Object.keys(cityAreas);

// Works with "islamabad", "Islamabad" or " Islamabad "
export function getAreas(city) {
  const key = cityNames.find(
    (c) => c.toLowerCase() === String(city || "").trim().toLowerCase()
  );
  return key ? cityAreas[key] : [];
}