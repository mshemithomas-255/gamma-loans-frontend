import { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link } from "react-router-dom";
import app from "../firebase/firebase";

const Register = () => {
  // initialize firebase
  const storage = getStorage(app);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    alternatemobile: "",
    password: "",
    photo: null,
    agreedTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "file" ? e.target.files[0] : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // send photo to firebase and import photourl
      const storageRef = ref(storage, `images/${formData.photo.name}`);
      await uploadBytes(storageRef, formData.photo);
      const photoURL = await getDownloadURL(storageRef);

      // log the url recieved from firebase
      console.log(photoURL);

      console.log(formData);

      // Trim spaces and check uniqueness
      if (formData.alternatemobile.trim() === formData.mobile.trim()) {
        alert("The two phone numbers must be different.");
        return;
      }

      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          formData.name,
          formData.agreedTerms,
          formData.alternatemobile,
          formData.email,
          formData.mobile,
          formData.password,
          photoURL
        ),
      });
      const data = await response.json();

      if (response.ok) {
        window.location.href = "/login";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-4 text-white">
      <div className="flex md:flex-row ">
        <div className="md:w-1/2 p-3">
          <div className="p-3">
            <p className="text-5xl mb-6">
              Welcome to a <span className="text-[#b9283b]">platform</span> that
              will open opportunities!
            </p>
            <p className="text-xl mb-2">
              create an <span className="text-[#b9283b]">account</span> in
              simple and easy steps
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-2">
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required
              className="bg-gray-600 text-white px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-[#b9283b]"
            />
            <input
              name="mobile"
              type="text"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile Number"
              required
              className="bg-gray-600 text-white px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-[#b9283b]"
            />
            <input
              name="alternatemobile"
              type="text"
              value={formData.alternatemobile}
              onChange={handleChange}
              placeholder="Alternate Mobile Number"
              required
              className="bg-gray-600 text-white px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-[#b9283b]"
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="bg-gray-600 text-white px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-[#b9283b]"
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="bg-gray-600 text-white px-3 py-2 rounded-md border focus:outline-none focus:ring-0 focus:border-[#b9283b]"
            />
            <input
              type="file"
              name="photo"
              id="photo"
              accept="image/*"
              onChange={handleImageChange}
              required
            />

            <label
              className="flex flex-row gap-3 items-center p-3"
              htmlFor="agreedTerms"
            >
              <input
                type="checkbox"
                name="agreedTerms"
                checked={formData.agreedTerms}
                onChange={handleChange}
                required
              />
              read our{" "}
              <Link to={"/terms"}>
                <span className="text-[#b9283b]">terms and conditions</span>
              </Link>
            </label>

            <button
              type="submit"
              className="bg-[#b9283b] text-white py-2 px-4 rounded-md max-w-40 hover:opacity-80 hover:shadow-md"
            >
              Register
            </button>
          </form>
          <div className="p-3">
            <p className="">
              Already registered?{" "}
              <Link to={"/login"}>
                <span className="text-[#b9283b]">Login</span>
              </Link>
            </p>
          </div>
        </div>
        {/* side div with image */}
        <div className="hidden md:block bg-yellow-900 md:w-1/2">side</div>
      </div>
    </div>
  );
};

export default Register;
