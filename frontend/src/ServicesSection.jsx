import { Link } from "react-router";
import { ArrowLeftRight, ClipboardCheck, Camera, Scale } from "lucide-react";

const services = [
  {
    to: "/compare",
    Icon: ArrowLeftRight,
    title: "Compare Cars",
    text: "Put up to 3 cars side by side and compare price, mileage, fuel and more.",
    cta: "Compare now",
  },
  {
    to: "/inspection",
    Icon: ClipboardCheck,
    title: "Car Inspection",
    text: "A step-by-step checklist to inspect a car before you buy.",
    cta: "View checklist",
  },
  {
    to: "/cars",
    Icon: Camera,
    title: "Photos & Video",
    text: "Every listing can have up to 20 photos and a 15-30 second video.",
    cta: "Browse cars",
  },
  {
    to: "/legal-help",
    Icon: Scale,
    title: "Legal Help",
    text: "Documents and steps you need for a safe purchase and ownership transfer.",
    cta: "Read guide",
  },
];

function ServicesSection() {
  return (
    <section className="services-section">
      <h2>Our Services</h2>
      <p className="cars-subtitle">Tools to help you buy and sell with confidence.</p>

      <div className="services-grid">
        {services.map(({ to, Icon, title, text, cta }) => (
          <Link to={to} className="service-card" key={to}>
            <span className="service-icon">
              <Icon size={26} strokeWidth={1.8} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
            <span className="service-link">{cta} →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ServicesSection;