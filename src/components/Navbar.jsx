import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaBars, FaTimes, FaUser, FaMoon, FaSun } from "react-icons/fa";

const Navbar = ({ user, onLogout, darkMode, toggleDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    onLogout();
    toast.success("Logged out successfully!");
    navigate("/");
  }, [onLogout, navigate]);

  const navLinks = (
    <>
      <Link
        to="/"
        className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
      >
        Home
      </Link>
      <Link
        to="/about"
        className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
      >
        About
      </Link>
      <Link
        to="/services"
        className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
      >
        Services
      </Link>
    </>
  );

  const dashboardLink = user ? (
    <Link
      to={user.role === "admin" ? "/admin" : "/dashboard"}
      className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
    >
      Dashboard
    </Link>
  ) : null;

  const userActions = user ? (
    <div className="relative">
      <button
        onClick={() => setIsUserDropdownOpen((prev) => !prev)}
        className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
      >
        <FaUser />
        <span>{user.fullName || user.name}</span>
      </button>
      {isUserDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 backdrop-blur-sm bg-opacity-90">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all rounded-lg"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  ) : (
    <Link
      to="/login"
      className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-all"
    >
      Login
    </Link>
  );

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold dark:text-blue-200">
          <Link to="/" aria-label="Go to homepage">
            <span className="text-blue-600">Gammaridge</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {navLinks}
          {dashboardLink}
        </nav>

        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <FaSun className="text-xl text-yellow-400" />
            ) : (
              <FaMoon className="text-xl text-gray-700" />
            )}
          </button>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {userActions}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden mt-4 bg-white dark:bg-gray-800">
          <div className="flex flex-col space-y-2">
            {navLinks}
            {dashboardLink}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex flex-col space-y-2 px-4">{userActions}</div>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
