import { Link } from "react-router";

const buyerSteps = [
  "Verify the seller's CNIC against the name on the registration documents",
  "Check the original registration book or smart card",
  "Match the engine and chassis numbers on the car with the papers",
  "Confirm that token tax and other dues are cleared",
  "Make a written sale agreement or receipt with both parties' details",
  "Complete the ownership transfer at the relevant excise office",
];

const sellerSteps = [
  "Keep your original registration documents and CNIC copy ready",
  "Clear all taxes and dues before the sale",
  "Write the sale agreement with price, date and car details",
  "Make sure ownership is transferred after the sale",
  "Keep copies of every paper you sign",
];

function LegalHelp() {
  return (
    <div className="cars-page info-page">
      <h1>Legal Help</h1>
      <p className="cars-subtitle">
        A simple guide to the documents and steps involved in buying or selling a car.
      </p>

      <div className="info-grid">
        <div className="info-card">
          <h3>If you are buying</h3>
          <ol>
            {buyerSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>

        <div className="info-card">
          <h3>If you are selling</h3>
          <ol>
            {sellerSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="info-note">
        <strong>Disclaimer:</strong> This page gives general information only and is
        not legal advice. Rules and fees differ by province and can change, so
        confirm the current requirements with your local excise office or a lawyer.
      </div>

      <p>
        <Link to="/cars">Browse cars →</Link>
      </p>
    </div>
  );
}

export default LegalHelp;