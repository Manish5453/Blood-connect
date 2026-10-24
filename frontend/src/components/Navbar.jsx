import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HeartPulse,
  LogOut,
  User,
  Menu,
  X,
  AlertTriangle,
  Calendar,
  ClipboardList,
  Truck,
  BarChart2,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <HeartPulse className="h-8 w-8 text-blood-600 animate-pulse" />
              <span className="text-xl font-bold text-gray-800">
                Blood<span className="text-blood-600">Connect</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-blood-600 font-medium"
            >
              Home
            </Link>
            <Link
              to="/donors"
              className="text-gray-600 hover:text-blood-600 font-medium"
            >
              Find Donors
            </Link>
            <Link
              to="/requests"
              className="text-gray-600 hover:text-blood-600 font-medium"
            >
              Emergency Requests
            </Link>
            <Link
              to="/inventory"
              className="text-gray-600 hover:text-blood-600 font-medium"
            >
              Blood Stock
            </Link>

            <Link
              to="/camps"
              className="text-gray-600 hover:text-blood-600 font-medium flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" /> Donation Camps
            </Link>

            {/* Donor Tracking Link */}
            <Link
              to="/donor-tracking"
              className="text-gray-600 hover:text-blood-600 font-medium flex items-center gap-1"
            >
              <Truck className="h-4 w-4" /> Donor Tracking
            </Link>

            {/* Issuance Log & Analytics link ONLY for Hospital role */}
            {user?.role === "hospital" && (
              <>
                <Link
                  to="/issuance-log"
                  className="text-gray-600 hover:text-blood-600 font-medium flex items-center gap-1"
                >
                  <ClipboardList className="h-4 w-4" /> Issuance Log
                </Link>
                <Link
                  to="/analytics"
                  className="text-gray-600 hover:text-blood-600 font-medium flex items-center gap-1"
                >
                  <BarChart2 className="h-4 w-4" /> Analytics
                </Link>
              </>
            )}

            {/* Emergency SOS Link */}
            <Link
              to="/emergency-sos"
              className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold animate-pulse"
            >
              <AlertTriangle className="h-4 w-4" /> Emergency SOS
            </Link>

            {user ? (
              <div className="flex items-center space-x-4 border-l pl-4">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <User className="h-4 w-4 text-blood-600" /> {user.name} (
                  {user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-blood-50 text-blood-600 px-3 py-1.5 rounded-lg hover:bg-blood-100 transition font-medium text-sm"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 border-l pl-4">
                <Link
                  to="/login"
                  className="text-blood-600 font-medium hover:underline"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blood-600 text-white px-4 py-2 rounded-lg hover:bg-blood-700 transition font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t px-4 pt-2 pb-4 space-y-3">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block text-gray-600 hover:text-blood-600 font-medium"
          >
            Home
          </Link>
          <Link
            to="/donors"
            onClick={() => setIsOpen(false)}
            className="block text-gray-600 hover:text-blood-600 font-medium"
          >
            Find Donors
          </Link>
          <Link
            to="/requests"
            onClick={() => setIsOpen(false)}
            className="block text-gray-600 hover:text-blood-600 font-medium"
          >
            Emergency Requests
          </Link>
          <Link
            to="/inventory"
            onClick={() => setIsOpen(false)}
            className="block text-gray-600 hover:text-blood-600 font-medium"
          >
            Blood Stock
          </Link>

          <Link
            to="/camps"
            onClick={() => setIsOpen(false)}
            className="text-gray-600 hover:text-blood-600 font-medium flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" /> Donation Camps
          </Link>

          <Link
            to="/donor-tracking"
            onClick={() => setIsOpen(false)}
            className="text-gray-600 hover:text-blood-600 font-medium flex items-center gap-1"
          >
            <Truck className="h-4 w-4" /> Donor Tracking
          </Link>

          {user?.role === "hospital" && (
            <>
              <Link
                to="/issuance-log"
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-blood-600 font-medium flex items-center gap-1"
              >
                <ClipboardList className="h-4 w-4" /> Issuance Log
              </Link>
              <Link
                to="/analytics"
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-blood-600 font-medium flex items-center gap-1"
              >
                <BarChart2 className="h-4 w-4" /> Analytics
              </Link>
            </>
          )}

          <Link
            to="/emergency-sos"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-1 text-red-600 font-bold"
          >
            <AlertTriangle className="h-4 w-4" /> Emergency SOS
          </Link>

          {user ? (
            <div className="pt-2 border-t">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Logged in as {user.name}
              </p>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1 bg-blood-50 text-blood-600 py-2 rounded-lg font-medium"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2 border-t">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-1/2 text-center py-2 border border-blood-600 text-blood-600 rounded-lg font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-1/2 text-center py-2 bg-blood-600 text-white rounded-lg font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;