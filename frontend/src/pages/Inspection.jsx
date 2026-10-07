import { Link } from "react-router";

const sections = [
  {
    title: "Exterior",
    items: [
      "Check panels for uneven gaps, which can point to accident repair",
      "Look for paint colour differences between panels",
      "Check for rust under doors, wheel arches and the boot floor",
      "Inspect tyres for even wear and the manufacturing date",
    ],
  },
  {
    title: "Engine & Mechanical",
    items: [
      "Start the engine cold and listen for unusual noises",
      "Check for oil or coolant leaks under the car",
      "Check the oil colour and coolant level",
      "Test the brakes, steering and suspension on a test drive",
    ],
  },
  {
    title: "Interior & Electronics",
    items: [
      "Test the AC, windows, lights, wipers and infotainment",
      "Check for warning lights on the dashboard",
      "Compare seat and pedal wear with the claimed mileage",
      "Look for water damage or a damp smell",
    ],
  },
  {
    title: "Documents",
    items: [
      "Match the engine and chassis numbers with the registration papers",
      "Check the seller's CNIC matches the registered owner",
      "Confirm token tax and other dues are paid",
    ],
  },
];

function Inspection() {
  return (
    <div className="cars-page info-page">
      <h1>Car Inspection Checklist</h1>
      <p className="cars-subtitle">
        A good inspection protects you from hidden problems. Use this checklist
        before you buy, and ask the seller for clear photos and videos of each area.
      </p>

      <div className="info-grid">
        {sections.map((s) => (
          <div className="info-card" key={s.title}>
            <h3>{s.title}</h3>
            <ul>
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="info-note">
        <strong>Tip:</strong> For an important purchase, have the car checked by a
        trusted mechanic or a professional inspection service before paying.
      </div>

      <p>
        <Link to="/cars">Browse cars →</Link>
      </p>
    </div>
  );
}

export default Inspection;
