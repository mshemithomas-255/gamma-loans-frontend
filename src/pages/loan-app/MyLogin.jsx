import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const MyLogin = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Email Validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password Validation
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    try {
      const response = await fetch(
        "https://gamma-loans-backend.vercel.app/api/users/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token); // Save the token
        toast.success("Login successful!");
        window.location.href = "/dashboard"; // Redirect to dashboard
      } else {
        toast.error(data.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        darkMode
          ? "bg-gradient-to-r from-gray-800 to-gray-900"
          : "bg-gradient-to-r from-blue-500 to-purple-600"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className={`${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
        } p-8 rounded-lg shadow-md w-96`}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg ${
              darkMode
                ? "bg-gray-600 text-white border-gray-500"
                : "bg-white text-gray-900 border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg ${
              darkMode
                ? "bg-gray-600 text-white border-gray-500"
                : "bg-white text-gray-900 border-gray-300"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="mb-6 text-right">
          <Link
            to="/forgot-password"
            className={`${
              darkMode
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-500 hover:text-blue-600"
            } hover:underline text-sm`}
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white py-2 rounded-lg transition-all`}
        >
          Login
        </button>

        {/* Register Link */}
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className={`${
              darkMode
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-500 hover:text-blue-600"
            } hover:underline`}
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default MyLogin;
