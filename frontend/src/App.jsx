import { Routes, Route } from "react-router";
import Navbar from "./Navbar";
import CarDetails from "./pages/CarDetails";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import SellCar from "./pages/SellCar";
import EditCar from "./pages/EditCar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyListings from "./pages/MyListings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SavedCars from "./pages/SavedCars";
import { AuthProvider } from "./AuthContext";
import { FavoritesProvider } from "./FavoritesContext";
import "./App.css";
import AdminDashboard from "./pages/AdminDashboard";
import SellerProfile from "./pages/SellerProfile";
import Compare from "./pages/Compare";
import Inspection from "./pages/Inspection";
import LegalHelp from "./pages/LegalHelp";
function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <div className="app">
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:id" element={<CarDetails />} />
            <Route path="/cars/:id/edit" element={<EditCar />} />
            <Route path="/sell" element={<SellCar />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/saved" element={<SavedCars />} />
            <Route path="/sellers/:id" element={<SellerProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/inspection" element={<Inspection />} />
            <Route path="/legal-help" element={<LegalHelp />} />
          </Routes>
        </div>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;