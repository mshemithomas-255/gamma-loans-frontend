import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/firebase";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const Register = ({ darkMode }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobileNumber: "",
    alternateMobileNumber: "",
    profilePhoto: null,
    idFrontPhoto: null,
    idBackPhoto: null,
    idNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle file (photo) change
  const handleFileChange = (e, field) => {
    setFormData({
      ...formData,
      [field]: e.target.files[0],
    });
  };

  // Validate form data
  const validateForm = () => {
    const {
      fullName,
      email,
      password,
      mobileNumber,
      alternateMobileNumber,
      profilePhoto,
      idFrontPhoto,
      idBackPhoto,
      idNumber,
    } = formData;

    if (
      !fullName ||
      !email ||
      !password ||
      !mobileNumber ||
      !alternateMobileNumber ||
      !profilePhoto ||
      !idFrontPhoto ||
      !idBackPhoto ||
      !idNumber
    ) {
      toast.error("All fields are required.");
      return false;
    }

    if (mobileNumber === alternateMobileNumber) {
      toast.error("Mobile numbers cannot be the same.");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    // Validate mobile number format (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (
      !mobileRegex.test(mobileNumber) ||
      !mobileRegex.test(alternateMobileNumber)
    ) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return false;
    }

    // Validate password length (6 or more characters)
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }

    return true;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Compress images
      const options = {
        maxSizeMB: 1, // Maximum file size in MB
        maxWidthOrHeight: 800, // Max width/height in pixels
        useWebWorker: true, // Enable web worker for faster compression
      };

      let compressedProfile, compressedFront, compressedBack;

      try {
        [compressedProfile, compressedFront, compressedBack] =
          await Promise.all([
            imageCompression(formData.profilePhoto, options),
            imageCompression(formData.idFrontPhoto, options),
            imageCompression(formData.idBackPhoto, options),
          ]);
      } catch (compressionError) {
        console.error("Image compression failed:", compressionError);
        toast.error("Failed to compress images. Please try again.");
        setLoading(false);
        return;
      }

      // Upload images to Firebase
      const uploadImage = async (file, path) => {
        try {
          const storageRef = ref(storage, `gamma/${Date.now()}-${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          return getDownloadURL(snapshot.ref);
        } catch (uploadError) {
          console.error("Firebase upload failed:", uploadError);
          throw new Error("Failed to upload images. Please try again.");
        }
      };

      let profilePhoto, idFrontPhoto, idBackPhoto;

      try {
        [profilePhoto, idFrontPhoto, idBackPhoto] = await Promise.all([
          uploadImage(compressedProfile, "profile"),
          uploadImage(compressedFront, "id-front"),
          uploadImage(compressedBack, "id-back"),
        ]);
      } catch (uploadError) {
        console.error("Firebase upload failed:", uploadError);
        toast.error(uploadError.message);
        setLoading(false);
        return;
      }

      // Prepare the request payload
      const payload = {
        ...formData,
        profilePhoto,
        idFrontPhoto,
        idBackPhoto,
      };

      // Log the payload for debugging
      console.log("Request Payload:", payload);

      // Save data to backend (MongoDB)
      try {
        const response = await fetch(
          "https://gamma-loans-backend.vercel.app/api/users/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        // Log the response for debugging
        const result = await response.json();
        console.log("API Response:", result);

        if (response.ok) {
          toast.success("Registration successful!");
          navigate("/login");
        } else {
          throw new Error(result.error);
        }
      } catch (apiError) {
        console.error("API request failed:", apiError);
        toast.error(apiError.message);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`max-w-6xl mx-auto p-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-[600px] md:block md:p-4 p-4">
          <h1 className="text-6xl justify-center mb-5 mt-2 font-bold">
            Welcome to{" "}
            <span className={`${darkMode ? "text-blue-400" : "text-blue-600"}`}>
              Gammaridge!
            </span>
          </h1>
          <p className="mb-5 text-xl">
            We’re excited to have you here. Join our community to access quick,
            reliable loans tailored to your needs. By registering, you’ll unlock
            an easy-to-use dashboard where you can manage your loan
            applications, track your loan status, and enjoy personalized
            financial services.
          </p>
          <p className="mb-5 text-xl">
            Sign up now and take the first step toward securing your financial
            future with us!
          </p>
        </div>
        <form onSubmit={handleSubmit} className="md:w-[600px] p-3 w-full">
          {/* Form fields */}
          <div className="mb-2">
            <label className="block">Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`${
                darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-blue-300 text-blue-950"
              } px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-blue-600 w-full`}
            />
          </div>

          <div className="mb-2">
            <label className="block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${
                darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-blue-300 text-blue-950"
              } px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-blue-600 w-full`}
            />
          </div>

          <div className="mb-2">
            <label className="block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-blue-300 text-blue-950"
                } px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-blue-600 w-full`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? (
                  <FaEyeSlash
                    className={darkMode ? "text-white" : "text-gray-700"}
                  />
                ) : (
                  <FaEye
                    className={darkMode ? "text-white" : "text-gray-700"}
                  />
                )}
              </button>
            </div>
          </div>

          <div className="mb-2">
            <label className="block">Mobile</label>
            <input
              type="text"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              className={`${
                darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-blue-300 text-blue-950"
              } px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-blue-600 w-full`}
            />
          </div>

          <div className="mb-2">
            <label className="block">Alternate Mobile</label>
            <input
              type="text"
              name="alternateMobileNumber"
              value={formData.alternateMobileNumber}
              onChange={handleChange}
              className={`${
                darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-blue-300 text-blue-950"
              } px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-blue-600 w-full`}
            />
          </div>

          <div className="mb-2">
            <label className="block">ID Number</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              className={`${
                darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-blue-300 text-blue-950"
              } px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-blue-600 w-full`}
            />
          </div>

          <div className="mb-2">
            <label className="block">Profile photo</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "profilePhoto")}
              className={`border p-2 w-full ${
                darkMode ? "bg-gray-700 text-white" : "bg-white text-blue-950"
              }`}
            />
          </div>

          <div className="mb-2">
            <label className="block">Front ID photo</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "idFrontPhoto")}
              className={`border p-2 w-full ${
                darkMode ? "bg-gray-700 text-white" : "bg-white text-blue-950"
              }`}
            />
          </div>

          <div className="mb-2">
            <label className="block">Back ID photo</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "idBackPhoto")}
              className={`border p-2 w-full ${
                darkMode ? "bg-gray-700 text-white" : "bg-white text-blue-950"
              }`}
            />
          </div>

          <button
            type="submit"
            className={`${
              darkMode ? "bg-blue-600" : "bg-blue-600"
            } w-full text-white p-2 rounded`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <div className="mt-3">
            Already have an account?{" "}
            <Link to={"/login"}>
              <span
                className={`${darkMode ? "text-blue-400" : "text-blue-600"}`}
              >
                Login
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
