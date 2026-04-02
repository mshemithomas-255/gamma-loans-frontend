import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  uploadToCloudinary,
  validateConfig,
} from "../../cloudinary/cloudinaryConfig";

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
  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    profile: 0,
    front: 0,
    back: 0,
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const validateFile = (file, fieldName) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${fieldName} must be a JPEG, PNG, or WebP image`);
        return false;
      }
      return true;
    };

    if (!validateFile(profilePhoto, "Profile photo")) return false;
    if (!validateFile(idFrontPhoto, "Front ID photo")) return false;
    if (!validateFile(idBackPhoto, "Back ID photo")) return false;

    return true;
  };

  // Compress image
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1, // Maximum file size in MB
      maxWidthOrHeight: 800, // Max width/height in pixels
      useWebWorker: true, // Enable web worker for faster compression
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Image compression failed:", error);
      throw new Error(`Failed to compress image: ${error.message}`);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Cloudinary configuration
    if (!validateConfig()) {
      toast.error(
        "Cloudinary is not configured properly. Please contact support.",
      );
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Show loading toast
      toast.loading("Compressing images...", { id: "upload" });

      // Compress images
      let compressedProfile, compressedFront, compressedBack;

      try {
        [compressedProfile, compressedFront, compressedBack] =
          await Promise.all([
            compressImage(formData.profilePhoto),
            compressImage(formData.idFrontPhoto),
            compressImage(formData.idBackPhoto),
          ]);
        toast.success("Images compressed successfully!", { id: "upload" });
      } catch (compressionError) {
        toast.error("Failed to compress images. Please try again.", {
          id: "upload",
        });
        setLoading(false);
        return;
      }

      // Upload images to Cloudinary with progress tracking
      toast.loading("Uploading profile photo...", { id: "upload" });

      let profilePhotoUrl, idFrontPhotoUrl, idBackPhotoUrl;

      try {
        // Upload profile photo
        const profileResult = await uploadToCloudinary(
          compressedProfile,
          "profile",
          (progress) =>
            setUploadProgress((prev) => ({ ...prev, profile: progress })),
        );
        profilePhotoUrl = profileResult.url;
        toast.success("Profile photo uploaded!", { id: "upload" });

        // Upload front ID photo
        toast.loading("Uploading front ID photo...", { id: "upload" });
        const frontResult = await uploadToCloudinary(
          compressedFront,
          "id-front",
          (progress) =>
            setUploadProgress((prev) => ({ ...prev, front: progress })),
        );
        idFrontPhotoUrl = frontResult.url;
        toast.success("Front ID photo uploaded!", { id: "upload" });

        // Upload back ID photo
        toast.loading("Uploading back ID photo...", { id: "upload" });
        const backResult = await uploadToCloudinary(
          compressedBack,
          "id-back",
          (progress) =>
            setUploadProgress((prev) => ({ ...prev, back: progress })),
        );
        idBackPhotoUrl = backResult.url;
        toast.success("All photos uploaded successfully!", { id: "upload" });
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        toast.error(
          uploadError.message || "Failed to upload images. Please try again.",
          { id: "upload" },
        );
        setLoading(false);
        return;
      }

      // Prepare the request payload (excluding file objects)
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        mobileNumber: formData.mobileNumber,
        alternateMobileNumber: formData.alternateMobileNumber,
        idNumber: formData.idNumber,
        profilePhoto: profilePhotoUrl,
        idFrontPhoto: idFrontPhotoUrl,
        idBackPhoto: idBackPhotoUrl,
      };

      // Log the payload for debugging
      console.log("Request Payload:", payload);

      // Save data to backend (MongoDB)
      toast.loading("Creating your account...", { id: "register" });

      try {
        const response = await fetch(
          "https://gamma-loans-backend.vercel.app/api/users/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        // Log the response for debugging
        const result = await response.json();
        console.log("API Response:", result);

        if (response.ok) {
          toast.success("Registration successful! Please login.", {
            id: "register",
          });
          navigate("/login");
        } else {
          throw new Error(
            result.error || result.message || "Registration failed",
          );
        }
      } catch (apiError) {
        console.error("API request failed:", apiError);
        toast.error(apiError.message, { id: "register" });
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      // Reset progress after 2 seconds
      setTimeout(() => {
        setUploadProgress({ profile: 0, front: 0, back: 0 });
      }, 2000);
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
            We&apos;re excited to have you here. Join our community to access
            quick, reliable loans tailored to your needs. By registering,
            you&apos;ll unlock an easy-to-use dashboard where you can manage
            your loan applications, track your loan status, and enjoy
            personalized financial services.
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

          {/* File upload sections with progress bars */}
          <div className="mb-2">
            <label className="block">Profile photo</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "profilePhoto")}
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className={`border p-2 w-full ${
                darkMode ? "bg-gray-700 text-white" : "bg-white text-blue-950"
              }`}
              disabled={loading}
            />
            {uploadProgress.profile > 0 && uploadProgress.profile < 100 && (
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.profile}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1">
                  Uploading: {Math.round(uploadProgress.profile)}%
                </p>
              </div>
            )}
          </div>

          <div className="mb-2">
            <label className="block">Front ID photo</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "idFrontPhoto")}
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className={`border p-2 w-full ${
                darkMode ? "bg-gray-700 text-white" : "bg-white text-blue-950"
              }`}
              disabled={loading}
            />
            {uploadProgress.front > 0 && uploadProgress.front < 100 && (
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.front}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1">
                  Uploading: {Math.round(uploadProgress.front)}%
                </p>
              </div>
            )}
          </div>

          <div className="mb-2">
            <label className="block">Back ID photo</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "idBackPhoto")}
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className={`border p-2 w-full ${
                darkMode ? "bg-gray-700 text-white" : "bg-white text-blue-950"
              }`}
              disabled={loading}
            />
            {uploadProgress.back > 0 && uploadProgress.back < 100 && (
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.back}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1">
                  Uploading: {Math.round(uploadProgress.back)}%
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`${
              darkMode ? "bg-blue-600" : "bg-blue-600"
            } w-full text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Register"}
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
