import { useState } from "react";

import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import app from "../firebase/firebase";
import { Link } from "react-router-dom";
import imageCompression from "browser-image-compression";

const RegisterForm = () => {
  const storage = getStorage(app);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    alternatemobile: "",
    photoFront: null,
    photoBack: null,
    terms: false,
  });

  const [loading, setLoading] = useState(false);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle file (photo) change separately
  const handleFile1Change = (e) => {
    setFormData({
      ...formData,
      photoFront: e.target.files[0],
    });
  };

  // Handle file (photo) change separately
  const handleFile2Change = (e) => {
    setFormData({
      ...formData,
      photoBack: e.target.files[0],
    });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      email,
      password,
      mobile,
      alternatemobile,
      photoFront,
      photoBack,
      terms,
    } = formData;

    // Validate form data
    if (
      !name ||
      !email ||
      !password ||
      !mobile ||
      !alternatemobile ||
      !photoFront ||
      !photoBack ||
      terms == false
    ) {
      alert("All fields are required.");
      return;
    }

    // Validate that mobile numbers are different
    if (mobile === alternatemobile) {
      alert("Mobile numbers cannot be the same.");
      return;
    }

    setLoading(true);

    try {
      // compress image
      const options = {
        maxSizeMB: 1, // Maximum file size in MB
        maxWidthOrHeight: 800, // Max width/height in pixels
        useWebWorker: true, // Enable web worker for faster compression
      };

      // compress images
      const IDfront = await imageCompression(photoFront, options);
      const IDback = await imageCompression(photoBack, options);

      // Upload photoFront to Firebase
      const photoRef1 = ref(storage, `jandm/${Date.now()}-${IDfront.name}`);
      const snapshot1 = await uploadBytes(photoRef1, IDfront);
      const photoURLFront = await getDownloadURL(snapshot1.ref);

      // Upload photoFront to Firebase
      const photoRef2 = ref(storage, `jandm/${Date.now()}-${IDback.name}`);
      const snapshot2 = await uploadBytes(photoRef2, IDback);
      const photoURLBack = await getDownloadURL(snapshot2.ref);

      // Save data to backend (MongoDB)
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          mobile,
          alternatemobile,
          photoURLFront,
          photoURLBack,
          terms,
        }),
      });

      const result = await response.json();

      window.location.href = "/login";
      console.log(result.message);
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
      setLoading(false);
      return;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 text-white">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-[600px] md:block md:p-4 p-4">
          <h1 className="text-6xl justify-center mb-5 mt-2">
            Welcome to <span className="text-[#b9283b]">Gammaridge!</span>
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
          <div className="mb-2">
            <label className="block">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-600 text-white px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-[#b9283b] w-full"
            />
          </div>

          <div className="mb-2">
            <label className="block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-gray-600 text-white px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-[#b9283b] w-full"
            />
          </div>

          <div className="mb-2">
            <label className="block">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="bg-gray-600 text-white px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-[#b9283b] w-full"
            />
          </div>

          <div className="mb-2">
            <label className="block">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="bg-gray-600 text-white px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-[#b9283b] w-full"
            />
          </div>

          <div className="mb-2">
            <label className="block">Alternate Mobile</label>
            <input
              type="text"
              name="alternatemobile"
              value={formData.alternatemobile}
              onChange={handleChange}
              className="bg-gray-600 text-white px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-[#b9283b] w-full"
            />
          </div>

          <div className="mb-2">
            <label className="block">Front ID photo</label>
            <input
              type="file"
              name="photoFront"
              onChange={handleFile1Change}
              className="border p-2 w-full text-white"
            />
          </div>

          <div className="mb-2">
            <label className="block">Back ID photo</label>
            <input
              type="file"
              name="photoBack"
              onChange={handleFile2Change}
              className="border p-2 w-full text-white"
            />
          </div>

          <div className="mb-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
              <span className="ml-2">
                I agree to the{" "}
                <Link to={"/terms"}>
                  <span className="text-blue-400 hover:underline">
                    terms and conditions
                  </span>
                </Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="bg-[#b9283b] w-full text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
          <div className="mt-3">
            Already have an account?{" "}
            <Link to={"/login"}>
              <span className="text-[#b9283b]">Login</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
